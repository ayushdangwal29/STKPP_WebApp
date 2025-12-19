import os
import numpy as np
from datetime import datetime, timedelta
import requests

class PredictionService:
    def __init__(self):
        self.api_key = os.environ.get('HUGGINGFACE_API_KEY', '')
        self.api_url = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli"
    
    def _calculate_technical_indicators(self, prices):
        prices = np.array(prices)
        
        sma_5 = np.mean(prices[-5:]) if len(prices) >= 5 else np.mean(prices)
        sma_20 = np.mean(prices[-20:]) if len(prices) >= 20 else np.mean(prices)
        
        if len(prices) >= 14:
            deltas = np.diff(prices[-15:])
            gains = np.where(deltas > 0, deltas, 0)
            losses = np.where(deltas < 0, -deltas, 0)
            avg_gain = np.mean(gains)
            avg_loss = np.mean(losses)
            rs = avg_gain / avg_loss if avg_loss > 0 else 100
            rsi = 100 - (100 / (1 + rs))
        else:
            rsi = 50
        
        if len(prices) >= 2:
            volatility = np.std(prices[-20:]) / np.mean(prices[-20:]) * 100 if len(prices) >= 20 else np.std(prices) / np.mean(prices) * 100
        else:
            volatility = 0
        
        momentum = ((prices[-1] - prices[-5]) / prices[-5] * 100) if len(prices) >= 5 else 0
        
        return {
            "sma_5": round(sma_5, 2),
            "sma_20": round(sma_20, 2),
            "rsi": round(rsi, 2),
            "volatility": round(volatility, 2),
            "momentum": round(momentum, 2)
        }
    
    def _get_sentiment_score(self, symbol):
        try:
            if not self.api_key:
                return 0.5
            
            headers = {"Authorization": f"Bearer {self.api_key}"}
            
            text = f"Stock {symbol} market performance outlook"
            payload = {
                "inputs": text,
                "parameters": {"candidate_labels": ["bullish", "bearish", "neutral"]}
            }
            
            response = requests.post(self.api_url, headers=headers, json=payload, timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                if 'labels' in result and 'scores' in result:
                    labels = result['labels']
                    scores = result['scores']
                    
                    bullish_score = scores[labels.index('bullish')] if 'bullish' in labels else 0
                    bearish_score = scores[labels.index('bearish')] if 'bearish' in labels else 0
                    
                    sentiment = (bullish_score - bearish_score + 1) / 2
                    return sentiment
            
            return 0.5
        except Exception:
            return 0.5
    
    def _generate_predictions(self, prices, days, indicators, sentiment):
        last_price = prices[-1]
        
        trend_factor = 1.0
        if indicators['sma_5'] > indicators['sma_20']:
            trend_factor = 1.02
        elif indicators['sma_5'] < indicators['sma_20']:
            trend_factor = 0.98
        
        rsi_factor = 1.0
        if indicators['rsi'] > 70:
            rsi_factor = 0.98
        elif indicators['rsi'] < 30:
            rsi_factor = 1.02
        
        sentiment_factor = 0.98 + (sentiment * 0.04)
        
        volatility_range = indicators['volatility'] / 100
        
        predictions = []
        current_price = last_price
        
        for i in range(days):
            date = datetime.now() + timedelta(days=i+1)
            
            if date.weekday() >= 5:
                continue
            
            combined_factor = (trend_factor * rsi_factor * sentiment_factor)
            daily_change = (combined_factor - 1) + np.random.normal(0, volatility_range * 0.3)
            
            predicted_price = current_price * (1 + daily_change)
            
            confidence = max(0.5, min(0.95, 0.85 - (i * 0.03) - (volatility_range * 0.5)))
            
            low_bound = predicted_price * (1 - volatility_range * 0.5)
            high_bound = predicted_price * (1 + volatility_range * 0.5)
            
            predictions.append({
                "date": date.strftime('%Y-%m-%d'),
                "predictedPrice": round(predicted_price, 2),
                "lowBound": round(low_bound, 2),
                "highBound": round(high_bound, 2),
                "confidence": round(confidence, 2)
            })
            
            current_price = predicted_price
        
        return predictions[:days]
    
    def predict(self, symbol, stock_data, days=7):
        try:
            prices = [item['close'] for item in stock_data['history']]
            
            if len(prices) < 5:
                raise Exception("Insufficient historical data for prediction")
            
            indicators = self._calculate_technical_indicators(prices)
            sentiment = self._get_sentiment_score(symbol)
            predictions = self._generate_predictions(prices, days, indicators, sentiment)
            
            if predictions:
                first_pred = predictions[0]['predictedPrice']
                last_pred = predictions[-1]['predictedPrice']
                overall_change = ((last_pred - prices[-1]) / prices[-1]) * 100
            else:
                overall_change = 0
            
            if overall_change > 2:
                recommendation = "BUY"
                recommendation_detail = "Technical indicators and market analysis suggest positive momentum."
            elif overall_change < -2:
                recommendation = "SELL"
                recommendation_detail = "Technical indicators suggest potential downward pressure."
            else:
                recommendation = "HOLD"
                recommendation_detail = "Market conditions appear stable. Consider holding current positions."
            
            return {
                "symbol": symbol,
                "currentPrice": stock_data['currentPrice'],
                "predictions": predictions,
                "indicators": indicators,
                "sentiment": round(sentiment, 2),
                "overallChange": round(overall_change, 2),
                "recommendation": recommendation,
                "recommendationDetail": recommendation_detail,
                "generatedAt": datetime.now().isoformat()
            }
        except Exception as e:
            raise Exception(f"Prediction error: {str(e)}")
