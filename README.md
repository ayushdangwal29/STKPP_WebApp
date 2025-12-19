# Stock Price Prediction Platform

A professional full-stack web application for stock price prediction and analysis. Get real-time stock prices, historical data, AI-powered predictions, and comprehensive market analysis.

## Features

- **Real-time Stock Prices**: Live price updates for stocks across global markets
- **Stock Search**: Find stocks by symbol or company name (supports US and Indian markets)
- **Price Charts**: Interactive historical price visualization
- **AI Predictions**: Machine learning-based price predictions with confidence scores
- **Market Analysis**: Comprehensive stock analysis with technical indicators
- **Responsive Design**: Clean, professional UI that works on all devices

## Project Structure

```
stock-prediction/
├── backend/
│   ├── app.py                 # Flask API server
│   ├── requirements.txt       # Python dependencies
│   ├── runtime.txt           # Python version for deployment
│   └── services/
│       ├── stock_service.py      # Stock data fetching
│       ├── prediction_service.py # ML predictions
│       └── analysis_service.py   # AI analysis
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── services/
│       │   └── api.js
│       └── components/
│           ├── Header.jsx
│           ├── SearchBar.jsx
│           ├── StockCard.jsx
│           ├── LivePrice.jsx
│           ├── PriceChart.jsx
│           ├── PredictionPanel.jsx
│           ├── AnalysisPanel.jsx
│           └── LoadingSpinner.jsx
├── render.yaml                # Render deployment config
├── .env.example              # Environment variables template
├── .gitignore
└── README.md
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | API key for AI analysis | Yes |
| `HUGGINGFACE_API_KEY` | API key for ML predictions | Yes |
| `PORT` | Server port (default: 5000) | No |

## Local Development

### Prerequisites

- Python 3.11.9
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export GEMINI_API_KEY=your_key_here
export HUGGINGFACE_API_KEY=your_key_here

# Run the server
python app.py
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will be available at `http://localhost:5173` and will proxy API requests to `http://localhost:5000`.

---

# Render Deployment Guide

## Step-by-Step Instructions

### Step 1: Prepare Your Repository

1. Push your code to a GitHub or GitLab repository
2. Make sure all files are committed including:
   - `backend/` folder with all Python files
   - `frontend/` folder with all React files
   - `render.yaml`
   - `backend/requirements.txt`
   - `backend/runtime.txt`

### Step 2: Create a Render Account

1. Go to [render.com](https://render.com)
2. Sign up with your GitHub or GitLab account
3. Verify your email address

### Step 3: Deploy the Backend API

1. Click **"New +"** in the Render dashboard
2. Select **"Web Service"**
3. Connect your repository
4. Configure the service:

   | Setting | Value |
   |---------|-------|
   | Name | `stock-prediction-api` |
   | Runtime | `Python 3` |
   | Build Command | `pip install -r backend/requirements.txt` |
   | Start Command | `cd backend && gunicorn --bind 0.0.0.0:$PORT --workers 2 --timeout 120 app:app` |

5. Add Environment Variables:
   - Click **"Environment"** tab
   - Add `GEMINI_API_KEY` with your key
   - Add `HUGGINGFACE_API_KEY` with your key

6. Click **"Create Web Service"**

7. Wait for deployment to complete (usually 3-5 minutes)

8. Copy the URL (e.g., `https://stock-prediction-api.onrender.com`)

### Step 4: Update Frontend API Configuration

Before deploying the frontend, update the API base URL:

1. Edit `frontend/src/services/api.js`
2. Change `API_BASE` to your backend URL:

```javascript
const API_BASE = 'https://stock-prediction-api.onrender.com/api'
```

3. Commit and push the change

### Step 5: Deploy the Frontend

1. Click **"New +"** in the Render dashboard
2. Select **"Static Site"**
3. Connect your repository
4. Configure the service:

   | Setting | Value |
   |---------|-------|
   | Name | `stock-prediction-frontend` |
   | Build Command | `cd frontend && npm install && npm run build` |
   | Publish Directory | `frontend/dist` |

5. Click **"Create Static Site"**

6. Wait for deployment to complete

### Step 6: Configure Redirects (Optional)

For single-page app routing, create a `_redirects` file in `frontend/public/`:

```
/*    /index.html   200
```

### Step 7: Verify Deployment

1. Open your frontend URL in a browser
2. Search for a stock (e.g., "AAPL" or "RELIANCE.NS")
3. Verify that:
   - Stock data loads correctly
   - Live prices update
   - Predictions generate successfully
   - Analysis tab shows AI insights

## Troubleshooting

### Backend Issues

**API returns 500 errors:**
- Check Render logs for Python errors
- Verify environment variables are set correctly
- Ensure all dependencies are in `requirements.txt`

**Timeout errors:**
- Increase `--timeout` in start command
- Consider upgrading Render plan for more resources

### Frontend Issues

**Blank page:**
- Check browser console for errors
- Verify build completed successfully
- Check `vite.config.js` settings

**API connection failed:**
- Verify backend URL in `api.js` is correct
- Check CORS settings in backend
- Ensure backend is running

### Common Fixes

1. **Cold starts**: Render's free tier spins down after inactivity. First request may take 30-60 seconds.

2. **Memory issues**: If predictions fail, try reducing model complexity or upgrading Render plan.

3. **Rate limiting**: For high traffic, consider caching responses or adding rate limiting.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/stock/search?q=QUERY` | GET | Search stocks |
| `/api/stock/{symbol}` | GET | Get stock data |
| `/api/stock/{symbol}/live` | GET | Get live price |
| `/api/stock/{symbol}/predict` | GET | Get predictions |
| `/api/stock/{symbol}/analyze` | GET | Get AI analysis |
| `/api/nse/stocks` | GET | List NSE stocks |

## Supported Stock Exchanges

- **NASDAQ** (US stocks)
- **NYSE** (US stocks)
- **NSE** (Indian stocks - use `.NS` suffix, e.g., `RELIANCE.NS`)

## License

This project is for educational purposes. Always consult financial advisors before making investment decisions.

---

**Disclaimer**: Stock predictions are for informational purposes only. Past performance does not guarantee future results. Always do your own research before investing.
