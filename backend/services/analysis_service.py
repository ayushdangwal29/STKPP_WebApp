import os
import google.generativeai as genai
from datetime import datetime

class AnalysisService:
    def __init__(self):
        api_key = os.environ.get('GEMINI_API_KEY', '')
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None
    
    def _calculate_metrics(self, history):
        if not history or len(history) < 2:
            return {}
        
        closes = [h['close'] for h in history]
        volumes = [h['volume'] for h in history]
        
        avg_price = sum(closes) / len(closes)
        max_price = max(closes)
        min_price = min(closes)
        price_range = max_price - min_price
        
        avg_volume = sum(volumes) / len(volumes)
        
        daily_returns = []
        for i in range(1, len(closes)):
            ret = (closes[i] - closes[i-1]) / closes[i-1] * 100
            daily_returns.append(ret)
        
        avg_return = sum(daily_returns) / len(daily_returns) if daily_returns else 0
        
        variance = sum((r - avg_return) ** 2 for r in daily_returns) / len(daily_returns) if daily_returns else 0
        volatility = variance ** 0.5
        
        positive_days = sum(1 for r in daily_returns if r > 0)
        total_days = len(daily_returns)
        win_rate = (positive_days / total_days * 100) if total_days > 0 else 0
        
        return {
            "averagePrice": round(avg_price, 2),
            "highestPrice": round(max_price, 2),
            "lowestPrice": round(min_price, 2),
            "priceRange": round(price_range, 2),
            "averageVolume": int(avg_volume),
            "averageDailyReturn": round(avg_return, 2),
            "volatility": round(volatility, 2),
            "winRate": round(win_rate, 2),
            "totalTradingDays": total_days
        }
    
    def _get_ai_analysis(self, symbol, stock_data, metrics):
        if not self.model:
            return self._get_fallback_analysis(symbol, stock_data, metrics)
        
        try:
            prompt = f"""Analyze this stock and provide a brief investment analysis (3-4 sentences):

Stock: {symbol}
Current Price: {stock_data.get('currentPrice', 'N/A')}
Change: {stock_data.get('changePercent', 0):.2f}%
52-Week High: {stock_data.get('fiftyTwoWeekHigh', 'N/A')}
52-Week Low: {stock_data.get('fiftyTwoWeekLow', 'N/A')}
Average Daily Return: {metrics.get('averageDailyReturn', 0):.2f}%
Volatility: {metrics.get('volatility', 0):.2f}%
Win Rate: {metrics.get('winRate', 0):.2f}%

Provide a concise analysis focusing on:
1. Current market position
2. Key risk factors
3. Short-term outlook

Keep the response under 100 words and professional."""

            response = self.model.generate_content(prompt)
            return response.text
        except Exception:
            return self._get_fallback_analysis(symbol, stock_data, metrics)
    
    def _get_fallback_analysis(self, symbol, stock_data, metrics):
        change_percent = stock_data.get('changePercent', 0)
        volatility = metrics.get('volatility', 0)
        win_rate = metrics.get('winRate', 50)
        
        if change_percent > 0:
            trend = "positive momentum"
        elif change_percent < 0:
            trend = "negative pressure"
        else:
            trend = "stable trading"
        
        if volatility > 3:
            risk = "higher volatility"
        elif volatility > 1.5:
            risk = "moderate volatility"
        else:
            risk = "lower volatility"
        
        if win_rate > 55:
            outlook = "favorable short-term outlook"
        elif win_rate < 45:
            outlook = "cautious short-term outlook"
        else:
            outlook = "neutral short-term outlook"
        
        analysis = f"{symbol} is showing {trend} in recent trading sessions. "
        analysis += f"The stock exhibits {risk}, which investors should consider in their risk assessment. "
        analysis += f"Based on recent price action with a {win_rate:.1f}% positive day rate, the stock has a {outlook}. "
        analysis += "Consider your investment goals and risk tolerance before making decisions."
        
        return analysis
    
    def analyze(self, symbol, stock_data):
        try:
            history = stock_data.get('history', [])
            metrics = self._calculate_metrics(history)
            ai_analysis = self._get_ai_analysis(symbol, stock_data, metrics)
            
            change_percent = stock_data.get('changePercent', 0)
            if change_percent > 1:
                sentiment = "Bullish"
            elif change_percent < -1:
                sentiment = "Bearish"
            else:
                sentiment = "Neutral"
            
            return {
                "symbol": symbol,
                "name": stock_data.get('name', symbol),
                "currentPrice": stock_data.get('currentPrice'),
                "change": stock_data.get('change'),
                "changePercent": stock_data.get('changePercent'),
                "metrics": metrics,
                "analysis": ai_analysis,
                "sentiment": sentiment,
                "generatedAt": datetime.now().isoformat()
            }
        except Exception as e:
            raise Exception(f"Analysis error: {str(e)}")
