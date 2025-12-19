# Deployment Guide for Render

This guide explains how to deploy the frontend and backend separately on Render.

## Overview
- **Backend**: Flask API on Render (Web Service)
- **Frontend**: React/Vite on Render (Static Site or Web Service)

## ⚡ Important: GPU Dependencies Removed

Your backend has been optimized for Render deployment by removing unnecessary GPU dependencies (torch, transformers, CUDA stack). 

**Result:**
- ✓ Build time: 2-3 minutes (was 15-30+ minutes)
- ✓ Image size: ~500-700 MB (was 3-5 GB)
- ✓ Runs on free Render tier (was crashing on limited memory)
- ✓ All features preserved: stock data, AI analysis, predictions, currency conversion

See `backend/RENDER_OPTIMIZATION.md` for full details.

## Backend Deployment

### 1. Create Backend Repository on Render
- Go to https://render.com/dashboard
- Click "New +" → "Web Service"
- Connect your GitHub repository
- Select the `backend` directory

### 2. Configure Backend Settings

**Name**: `stockpredict-api` (or your preferred name)

**Environment**: `Python`

**Build Command**:
```
pip install -r backend/requirements.txt
```

**Start Command**:
```
gunicorn --bind 0.0.0.0:$PORT --timeout 120 --workers 2 main:app
```

**Environment Variables** (add in Render dashboard):
```
GEMINI_API_KEY=your_gemini_key
HUGGING_FACE_API_KEY=your_hugging_face_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
DATABASE_URL=your_neon_postgresql_url
SESSION_SECRET=generate_a_secure_random_string
CORS_ORIGIN=https://your-frontend-url.onrender.com
PORT=5000
```

### 3. Get Backend URL
After deployment, you'll get a URL like: `https://stockpredict-api.onrender.com`

---

## Frontend Deployment

### 1. Create Frontend Repository on Render
- Click "New +" → "Web Service" (or Static Site if you only want static hosting)
- Connect your GitHub repository
- Select the `frontend` directory

### 2. Configure Frontend Settings

**Name**: `stockpredict-web` (or your preferred name)

**Environment**: `Node`

**Build Command**:
```
npm install && npm run build
```

**Start Command** (for Web Service):
```
npm run build && npx serve -s dist -l 3000
```

Or use Static Site instead:
- **Publish Directory**: `dist`
- No start command needed

**Environment Variables**:
```
VITE_API_BASE_URL=https://stockpredict-api.onrender.com/api
NODE_ENV=production
```

### 3. Get Frontend URL
After deployment, you'll get a URL like: `https://stockpredict-web.onrender.com`

---

## Post-Deployment Steps

1. **Update Backend CORS_ORIGIN**
   - In Render dashboard → Backend service → Environment
   - Update `CORS_ORIGIN` to match your frontend URL
   - Redeploy

2. **Verify Connection**
   - Open your frontend URL
   - Search for a stock (e.g., AAPL)
   - Check browser console for API errors

3. **Monitor Logs**
   - Backend: Check Render logs for API errors
   - Frontend: Use browser DevTools console

---

## Troubleshooting

### CORS Errors
- **Problem**: Frontend can't reach backend
- **Solution**: Check `CORS_ORIGIN` environment variable matches frontend URL exactly

### API 404 Errors
- **Problem**: API routes not found
- **Solution**: Verify `VITE_API_BASE_URL` includes `/api` at the end

### Build Failures
- **Backend**: Ensure all Python dependencies are in `requirements.txt`
- **Frontend**: Ensure `npm run build` works locally before deploying

### Slow Performance
- Increase Render plan for better performance
- Backend might need more memory for data processing

---

## Database Setup (Optional)

If using Render's PostgreSQL:
1. Create a PostgreSQL database on Render
2. Copy the connection string
3. Add as `DATABASE_URL` to backend environment variables

Or use Neon (recommended for free tier):
- https://neon.tech
- Provides generous free tier with PostgreSQL

---

## Local Development

To run locally while testing separate deployments:

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
gunicorn --bind 0.0.0.0:5000 --reload main:app
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:5173`
Backend API at `http://localhost:5000/api`

---

## File Structure for Render

Your repository should look like:
```
project-root/
├── backend/
│   ├── app.py
│   ├── main.py
│   ├── requirements.txt
│   ├── services/
│   └── .env (local only, add to .gitignore)
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.development
│   └── .env.production
├── .gitignore
└── RENDER_DEPLOYMENT.md
```

Both `backend/.env` and `frontend/.env.production` should NOT be in git (add to `.gitignore`).

---

## Support

For issues:
1. Check Render logs: Dashboard → Your Service → Logs
2. Review this deployment guide
3. Verify all environment variables are set correctly
4. Ensure frontend URL matches CORS_ORIGIN in backend
