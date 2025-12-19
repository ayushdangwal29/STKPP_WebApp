import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import json
import time
import requests
from io import StringIO
import os
from forex_python.converter import CurrencyRates
import logging

# Setup logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class RateLimitException(Exception):
    """Raised when rate limit is exceeded"""
    pass

class CurrencyConversionException(Exception):
    """Raised when currency conversion fails"""
    pass

class SimpleRateLimiter:
    def __init__(self, max_calls=5, window=60):
        self.max_calls = max_calls
        self.window = window
        self.calls = {}

    def allow(self, key):
        now = time.time()
        timestamps = self.calls.get(key, [])
        timestamps = [t for t in timestamps if now - t < self.window]

        if len(timestamps) >= self.max_calls:
            return False

        timestamps.append(now)
        self.calls[key] = timestamps
        return True

class SimpleCache:
    def __init__(self, ttl=300):
        self.cache = {}
        self.ttl = ttl

    def get(self, key):
        if key in self.cache:
            data, timestamp = self.cache[key]
            if time.time() - timestamp < self.ttl:
                return data
            del self.cache[key]
        return None

    def set(self, key, value):
        self.cache[key] = (value, time.time())

class CurrencyConverter:
    """Convert prices from USD to INR"""
    def __init__(self):
        self.cr = CurrencyRates()
        self.cache = {}
        self.cache_time = None
    
    def get_exchange_rate(self, from_currency='USD', to_currency='INR'):
        """Get exchange rate with caching (5 min TTL)"""
        try:
            cache_key = f"{from_currency}_{to_currency}"
            now = time.time()
            
            if cache_key in self.cache and self.cache_time:
                if now - self.cache_time < 300:
                    return self.cache[cache_key]
            
            rate = self.cr.get_rate(from_currency, to_currency)
            self.cache[cache_key] = rate
            self.cache_time = now
            return rate
        except Exception as e:
            logger.error(f"Currency conversion error: {str(e)}")
            return 83.0  # Default fallback rate
    
    def convert_price(self, price_usd, to_currency='INR'):
        """Convert price to target currency"""
        try:
            rate = self.get_exchange_rate('USD', to_currency)
            return round(price_usd * rate, 2)
        except Exception as e:
            logger.error(f"Price conversion error: {str(e)}")
            return round(price_usd * 83.0, 2)  # Fallback

class StockService:
    def __init__(self):
        self.rate_limiter = SimpleRateLimiter(max_calls=5, window=60)
        self.cache = SimpleCache(ttl=300)
        self.currency_converter = CurrencyConverter()
        self.popular_stocks = [
            {"symbol": "AAPL", "name": "Apple Inc.", "exchange": "NASDAQ"},
            {"symbol": "GOOGL", "name": "Alphabet Inc.", "exchange": "NASDAQ"},
            {"symbol": "MSFT", "name": "Microsoft Corporation", "exchange": "NASDAQ"},
            {"symbol": "AMZN", "name": "Amazon.com Inc.", "exchange": "NASDAQ"},
            {"symbol": "TSLA", "name": "Tesla Inc.", "exchange": "NASDAQ"},
            {"symbol": "META", "name": "Meta Platforms Inc.", "exchange": "NASDAQ"},
            {"symbol": "NVDA", "name": "NVIDIA Corporation", "exchange": "NASDAQ"},
            {"symbol": "JPM", "name": "JPMorgan Chase & Co.", "exchange": "NYSE"},
            {"symbol": "V", "name": "Visa Inc.", "exchange": "NYSE"},
            {"symbol": "WMT", "name": "Walmart Inc.", "exchange": "NYSE"},
            {"symbol": "RELIANCE.NS", "name": "Reliance Industries", "exchange": "NSE"},
            {"symbol": "TCS.NS", "name": "Tata Consultancy Services", "exchange": "NSE"},
            {"symbol": "HDFCBANK.NS", "name": "HDFC Bank", "exchange": "NSE"},
            {"symbol": "INFY.NS", "name": "Infosys", "exchange": "NSE"},
            {"symbol": "ICICIBANK.NS", "name": "ICICI Bank", "exchange": "NSE"},
            {"symbol": "SBIN.NS", "name": "State Bank of India", "exchange": "NSE"},
            {"symbol": "BHARTIARTL.NS", "name": "Bharti Airtel", "exchange": "NSE"},
            {"symbol": "ITC.NS", "name": "ITC Limited", "exchange": "NSE"},
            {"symbol": "KOTAKBANK.NS", "name": "Kotak Mahindra Bank", "exchange": "NSE"},
            {"symbol": "LT.NS", "name": "Larsen & Toubro", "exchange": "NSE"},
        ]
    
    def _convert_to_stooq_symbol(self, symbol):
        """Convert Yahoo Finance symbol format to Stooq format"""
        if symbol.endswith('.NS') or symbol.endswith('.BO'):
            clean = symbol.replace('.NS', '').replace('.BO', '')
            return f"{clean.lower()}.in"
        elif symbol.endswith('.L'):
            clean = symbol.replace('.L', '')
            return f"{clean.lower()}.uk"
        else:
            return f"{symbol.lower()}.us"
    
    def search_stocks(self, query):
        query = query.upper()
        results = []
        
        for stock in self.popular_stocks:
            if query in stock["symbol"].upper() or query in stock["name"].upper():
                results.append(stock)
        
        if len(results) < 5:
            try:
                if not self.rate_limiter.allow(f"search_{query}"):
                    return results[:10]
                ticker = yf.Ticker(query)
                info = ticker.info
                if info and info.get('symbol'):
                    results.append({
                        "symbol": info.get('symbol', query),
                        "name": info.get('longName', info.get('shortName', query)),
                        "exchange": info.get('exchange', 'Unknown')
                    })
            except:
                pass
        
        return results[:10]
    
    def fetch_from_stooq(self, symbol):
        stooq_symbol = self._convert_to_stooq_symbol(symbol)
        url = f"https://stooq.com/q/d/l/?s={stooq_symbol}&i=d"
        r = requests.get(url, timeout=10)
        if r.status_code != 200:
            raise Exception("Stooq unavailable")
        
        csv_data = r.text
        if 'No data' in csv_data or len(csv_data.strip()) < 50:
            raise Exception("No data from Stooq")
        
        df = pd.read_csv(StringIO(csv_data))
        if df.empty:
            raise Exception("Empty data from Stooq")
        
        df = df.tail(30)
        
        history_data = []
        for _, row in df.iterrows():
            history_data.append({
                "date": row['Date'],
                "open": round(float(row['Open']), 2),
                "high": round(float(row['High']), 2),
                "low": round(float(row['Low']), 2),
                "close": round(float(row['Close']), 2),
                "volume": int(row.get('Volume', 0)) if pd.notna(row.get('Volume', 0)) else 0
            })
        
        current_price = history_data[-1]['close'] if history_data else 0
        prev_close = history_data[-2]['close'] if len(history_data) > 1 else current_price
        change = current_price - prev_close
        change_percent = (change / prev_close * 100) if prev_close > 0 else 0
        
        return {
            "symbol": symbol,
            "name": symbol,
            "currentPrice": round(current_price, 2),
            "currentPriceINR": self.currency_converter.convert_price(current_price),
            "previousClose": round(prev_close, 2),
            "previousCloseINR": self.currency_converter.convert_price(prev_close),
            "change": round(change, 2),
            "changePercent": round(change_percent, 2),
            "currency": "USD",
            "exchange": "Unknown",
            "marketCap": 0,
            "fiftyTwoWeekHigh": 0,
            "fiftyTwoWeekLow": 0,
            "history": history_data
        }
    
    def fetch_from_yahoo(self, symbol, period='1mo'):
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=period)
        info = ticker.info
        
        if hist.empty:
            raise Exception(f"No data found for symbol: {symbol}")
        
        history_data = []
        for date, row in hist.iterrows():
            history_data.append({
                "date": date.strftime('%Y-%m-%d'),
                "open": round(float(row['Open']), 2),
                "high": round(float(row['High']), 2),
                "low": round(float(row['Low']), 2),
                "close": round(float(row['Close']), 2),
                "volume": int(row['Volume'])
            })
        
        current_price = float(hist['Close'].iloc[-1]) if not hist.empty else 0
        prev_close = float(hist['Close'].iloc[-2]) if len(hist) > 1 else current_price
        change = current_price - prev_close
        change_percent = (change / prev_close * 100) if prev_close > 0 else 0
        
        return {
            "symbol": symbol,
            "name": info.get('longName', info.get('shortName', symbol)),
            "currentPrice": round(current_price, 2),
            "currentPriceINR": self.currency_converter.convert_price(current_price),
            "previousClose": round(prev_close, 2),
            "previousCloseINR": self.currency_converter.convert_price(prev_close),
            "change": round(change, 2),
            "changePercent": round(change_percent, 2),
            "currency": info.get('currency', 'USD'),
            "exchange": info.get('exchange', 'Unknown'),
            "marketCap": info.get('marketCap', 0),
            "fiftyTwoWeekHigh": info.get('fiftyTwoWeekHigh', 0),
            "fiftyTwoWeekLow": info.get('fiftyTwoWeekLow', 0),
            "fiftyTwoWeekHighINR": self.currency_converter.convert_price(info.get('fiftyTwoWeekHigh', 0)),
            "fiftyTwoWeekLowINR": self.currency_converter.convert_price(info.get('fiftyTwoWeekLow', 0)),
            "history": history_data
        }
    
    def get_stock_data(self, symbol, period='1mo'):
        cache_key = f"stock_{symbol}_{period}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        if not self.rate_limiter.allow(symbol):
            cached_any = self.cache.get(f"stock_{symbol}_1mo") or self.cache.get(f"stock_{symbol}_3mo")
            if cached_any:
                return cached_any
            raise RateLimitException("Rate limit exceeded. Please wait a moment before trying again.")
        
        try:
            data = self.fetch_from_yahoo(symbol, period)
            self.cache.set(cache_key, data)
            return data
        except Exception as yahoo_error:
            try:
                data = self.fetch_from_stooq(symbol)
                self.cache.set(cache_key, data)
                return data
            except Exception as stooq_error:
                raise Exception(f"Error fetching stock data: {str(yahoo_error)}")
    
    def get_live_price(self, symbol):
        cache_key = f"live_{symbol}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        if not self.rate_limiter.allow(f"live_{symbol}"):
            if cached:
                return cached
            raise RateLimitException("Rate limit exceeded. Please wait a moment before trying again.")
        
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            hist = ticker.history(period='1d', interval='1m')
            
            if hist.empty:
                hist = ticker.history(period='5d')
            
            if hist.empty:
                raise Exception(f"No live data available for {symbol}")
            
            current_price = float(hist['Close'].iloc[-1])
            open_price = float(hist['Open'].iloc[0])
            high_price = float(hist['High'].max())
            low_price = float(hist['Low'].min())
            volume = int(hist['Volume'].sum())
            
            prev_close = info.get('previousClose', open_price)
            change = current_price - prev_close
            change_percent = (change / prev_close * 100) if prev_close > 0 else 0
            
            result = {
                "symbol": symbol,
                "name": info.get('longName', info.get('shortName', symbol)),
                "price": round(current_price, 2),
                "priceINR": self.currency_converter.convert_price(current_price),
                "open": round(open_price, 2),
                "openINR": self.currency_converter.convert_price(open_price),
                "high": round(high_price, 2),
                "highINR": self.currency_converter.convert_price(high_price),
                "low": round(low_price, 2),
                "lowINR": self.currency_converter.convert_price(low_price),
                "volume": volume,
                "previousClose": round(prev_close, 2),
                "previousCloseINR": self.currency_converter.convert_price(prev_close),
                "change": round(change, 2),
                "changePercent": round(change_percent, 2),
                "currency": info.get('currency', 'USD'),
                "timestamp": datetime.now().isoformat()
            }
            
            self.cache.set(cache_key, result)
            return result
        except Exception as e:
            raise Exception(f"Error fetching live price: {str(e)}")
    
    def get_nse_stocks(self):
        nse_stocks = [stock for stock in self.popular_stocks if stock["exchange"] == "NSE"]
        return nse_stocks
