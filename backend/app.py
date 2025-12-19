import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from services.stock_service import StockService, RateLimitException
from services.prediction_service import PredictionService
from services.analysis_service import AnalysisService

app = Flask(__name__)

# Configure CORS for separate frontend deployment
CORS(app, resources={
    r"/api/*": {
        "origins": os.environ.get("CORS_ORIGIN", "http://localhost:5173").split(","),
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

stock_service = StockService()
prediction_service = PredictionService()
analysis_service = AnalysisService()

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "API is running"})

@app.route('/api/stock/search', methods=['GET'])
def search_stocks():
    query = request.args.get('q', '')
    if not query:
        return jsonify({"error": "Query parameter 'q' is required"}), 400
    
    try:
        results = stock_service.search_stocks(query)
        return jsonify({"results": results})
    except RateLimitException as e:
        return jsonify({
            "error": "Rate limit exceeded",
            "details": str(e)
        }), 429
    except Exception as e:
        return jsonify({
            "error": "External data provider unavailable",
            "details": str(e)
        }), 503

@app.route('/api/stock/<symbol>', methods=['GET'])
def get_stock_data(symbol):
    period = request.args.get('period', '1mo')
    try:
        data = stock_service.get_stock_data(symbol, period)
        return jsonify(data)
    except RateLimitException as e:
        return jsonify({
            "error": "Rate limit exceeded",
            "details": str(e)
        }), 429
    except Exception as e:
        return jsonify({
            "error": "External data provider unavailable",
            "details": str(e)
        }), 503

@app.route('/api/stock/<symbol>/live', methods=['GET'])
def get_live_price(symbol):
    try:
        data = stock_service.get_live_price(symbol)
        return jsonify(data)
    except RateLimitException as e:
        return jsonify({
            "error": "Rate limit exceeded",
            "details": str(e)
        }), 429
    except Exception as e:
        return jsonify({
            "error": "External data provider unavailable",
            "details": str(e)
        }), 503

@app.route('/api/stock/<symbol>/predict', methods=['GET'])
def predict_stock(symbol):
    days = request.args.get('days', 7, type=int)
    try:
        stock_data = stock_service.get_stock_data(symbol, '3mo')
        prediction = prediction_service.predict(symbol, stock_data, days)
        return jsonify(prediction)
    except RateLimitException as e:
        return jsonify({
            "error": "Rate limit exceeded",
            "details": str(e)
        }), 429
    except Exception as e:
        return jsonify({
            "error": "External data provider unavailable",
            "details": str(e)
        }), 503

@app.route('/api/stock/<symbol>/analyze', methods=['GET'])
def analyze_stock(symbol):
    try:
        stock_data = stock_service.get_stock_data(symbol, '3mo')
        analysis = analysis_service.analyze(symbol, stock_data)
        return jsonify(analysis)
    except RateLimitException as e:
        return jsonify({
            "error": "Rate limit exceeded",
            "details": str(e)
        }), 429
    except Exception as e:
        return jsonify({
            "error": "External data provider unavailable",
            "details": str(e)
        }), 503

@app.route('/api/nse/stocks', methods=['GET'])
def get_nse_stocks():
    try:
        stocks = stock_service.get_nse_stocks()
        return jsonify({"stocks": stocks})
    except RateLimitException as e:
        return jsonify({
            "error": "Rate limit exceeded",
            "details": str(e)
        }), 429
    except Exception as e:
        return jsonify({
            "error": "External data provider unavailable",
            "details": str(e)
        }), 503

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
