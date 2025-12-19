import React, { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import SearchBar from './components/SearchBar'
import StockCard from './components/StockCard'
import PriceChart from './components/PriceChart'
import PredictionPanel from './components/PredictionPanel'
import AnalysisPanel from './components/AnalysisPanel'
import LivePrice from './components/LivePrice'
import LoadingSpinner from './components/LoadingSpinner'
import { fetchStockData, fetchPrediction, fetchAnalysis } from './services/api'

function App() {
  const [selectedStock, setSelectedStock] = useState(null)
  const [stockData, setStockData] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [darkMode, setDarkMode] = useState(false)
  const [currency, setCurrency] = useState('USD')

  const handleStockSelect = useCallback(async (stock) => {
    setSelectedStock(stock)
    setLoading(true)
    setError(null)
    setPrediction(null)
    setAnalysis(null)

    try {
      const data = await fetchStockData(stock.symbol)
      setStockData(data)
    } catch (err) {
      setError(err.message || 'Failed to fetch stock data')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleGetPrediction = useCallback(async () => {
    if (!selectedStock) return
    
    setLoading(true)
    try {
      const pred = await fetchPrediction(selectedStock.symbol, 7)
      setPrediction(pred)
      setActiveTab('prediction')
    } catch (err) {
      setError(err.message || 'Failed to get prediction')
    } finally {
      setLoading(false)
    }
  }, [selectedStock])

  const handleGetAnalysis = useCallback(async () => {
    if (!selectedStock) return
    
    setLoading(true)
    try {
      const anal = await fetchAnalysis(selectedStock.symbol)
      setAnalysis(anal)
      setActiveTab('analysis')
    } catch (err) {
      setError(err.message || 'Failed to get analysis')
    } finally {
      setLoading(false)
    }
  }, [selectedStock])

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gradient-to-br from-slate-900 to-blue-900' : 'bg-gradient-to-br from-slate-50 to-blue-50'}`}>
      <Header darkMode={darkMode} setDarkMode={setDarkMode} currency={currency} setCurrency={setCurrency} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <SearchBar onSelect={handleStockSelect} />
        </div>

        {error && (
          <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-red-900 border border-red-700 text-red-100' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {loading && <LoadingSpinner />}

        {stockData && !loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <StockCard data={stockData} currency={currency} darkMode={darkMode} />
              </div>
              <div>
                <LivePrice symbol={selectedStock?.symbol} currency={currency} darkMode={darkMode} />
              </div>
            </div>

            <div className="card">
              <div className="flex space-x-1 mb-6 border-b border-gray-100 pb-4">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Price Chart
                </button>
                <button
                  onClick={() => {
                    if (!prediction) handleGetPrediction()
                    else setActiveTab('prediction')
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'prediction'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Prediction
                </button>
                <button
                  onClick={() => {
                    if (!analysis) handleGetAnalysis()
                    else setActiveTab('analysis')
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'analysis'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Analysis
                </button>
              </div>

              {activeTab === 'overview' && (
                <PriceChart data={stockData.history} symbol={stockData.symbol} />
              )}
              
              {activeTab === 'prediction' && prediction && (
                <PredictionPanel prediction={prediction} />
              )}
              
              {activeTab === 'analysis' && analysis && (
                <AnalysisPanel analysis={analysis} />
              )}
            </div>
          </div>
        )}

        {!stockData && !loading && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-6">
              <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Search for a Stock</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Enter a stock symbol or company name to view real-time prices, historical data, and AI-powered predictions.
            </p>
          </div>
        )}
      </main>

      <footer className="mt-16 py-8 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            Stock predictions are for informational purposes only. Always do your own research before investing.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
