# Stock Price Prediction Platform

## Overview
A full-stack stock price prediction web application with Python backend and React frontend. Features include real-time stock prices, historical data visualization, ML-based predictions, and AI-powered analysis.

## Project Structure
```
/
├── backend/               # Python Flask API
│   ├── app.py            # Main Flask application
│   ├── requirements.txt  # Python dependencies
│   ├── runtime.txt       # Python version (3.11.9)
│   └── services/         # Business logic services
│       ├── stock_service.py      # Stock data fetching (yfinance)
│       ├── prediction_service.py # ML predictions (Hugging Face)
│       └── analysis_service.py   # AI analysis (Gemini)
├── frontend/             # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx       # Main React component
│   │   ├── components/   # UI components
│   │   └── services/     # API service layer
│   ├── package.json
│   └── vite.config.js
├── render.yaml           # Render deployment config
├── .env.example          # Environment template
└── README.md             # Full documentation with Render guide
```

## Tech Stack
- **Backend**: Python 3.11, Flask, yfinance, nsepython
- **ML/AI**: Hugging Face API, Gemini API
- **Frontend**: React 18, Vite, Tailwind CSS, Recharts
- **Deployment**: Configured for Render.com

## Environment Variables Required
- `GEMINI_API_KEY` - For AI analysis
- `HUGGINGFACE_API_KEY` - For ML predictions

## Running Locally
- Backend runs on port 5000
- Frontend runs on port 5173 (proxies to backend)
- Use `concurrently` or run in separate terminals

## Recent Changes
- Initial project setup
- Created full backend API with stock data, predictions, analysis endpoints
- Created professional React frontend with charts and data visualization
- Added Render deployment configuration
- Added comprehensive README with deployment guide
