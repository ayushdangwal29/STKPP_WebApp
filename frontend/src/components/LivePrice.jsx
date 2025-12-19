import React, { useState, useEffect, useCallback } from 'react'
import { fetchLivePrice } from '../services/api'

function LivePrice({ symbol, currency = 'USD', darkMode = false }) {
  const [liveData, setLiveData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)

  const fetchPrice = useCallback(async () => {
    if (!symbol) return
    
    setLoading(true)
    try {
      const data = await fetchLivePrice(symbol)
      setLiveData(data)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Failed to fetch live price:', error)
    } finally {
      setLoading(false)
    }
  }, [symbol])

  useEffect(() => {
    fetchPrice()
    const interval = setInterval(fetchPrice, 30000)
    return () => clearInterval(interval)
  }, [fetchPrice])

  if (!symbol) return null

  const isPositive = liveData?.change >= 0
  const priceDisplay = currency === 'INR' ? liveData?.priceINR : liveData?.price
  const openDisplay = currency === 'INR' ? liveData?.openINR : liveData?.open
  const highDisplay = currency === 'INR' ? liveData?.highINR : liveData?.high
  const lowDisplay = currency === 'INR' ? liveData?.lowINR : liveData?.low

  return (
    <div className={`rounded-xl p-6 h-full ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Live Price</h3>
        <div className="flex items-center space-x-2">
          {loading && (
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
          )}
          <button
            onClick={fetchPrice}
            disabled={loading}
            className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
            title="Refresh"
          >
            <svg className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'} ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {liveData ? (
        <div className="space-y-4">
          <div className={`text-center py-4 rounded-xl ${darkMode ? 'bg-gradient-to-br from-slate-700 to-slate-600' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
            <p className={`text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {currency === 'INR' ? '₹' : '$'}{priceDisplay?.toLocaleString()}
            </p>
            <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium ${
              isPositive 
                ? darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'
                : darkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700'
            }`}>
              {isPositive ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              <span>{isPositive ? '+' : ''}{liveData.changePercent?.toFixed(2)}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className={`rounded-lg p-2.5 ${darkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Open</p>
              <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{currency === 'INR' ? '₹' : '$'}{openDisplay?.toLocaleString()}</p>
            </div>
            <div className={`rounded-lg p-2.5 ${darkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Volume</p>
              <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{(liveData.volume / 1e6).toFixed(2)}M</p>
            </div>
            <div className={`rounded-lg p-2.5 ${darkMode ? 'bg-slate-700' : 'bg-green-50'}`}>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>High</p>
              <p className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'}`}>{currency === 'INR' ? '₹' : '$'}{highDisplay?.toLocaleString()}</p>
            </div>
            <div className={`rounded-lg p-2.5 ${darkMode ? 'bg-slate-700' : 'bg-red-50'}`}>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Low</p>
              <p className={`font-semibold ${darkMode ? 'text-red-400' : 'text-red-700'}`}>{currency === 'INR' ? '₹' : '$'}{lowDisplay?.toLocaleString()}</p>
            </div>
          </div>

          {lastUpdate && (
            <p className={`text-xs text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>
      ) : (
        <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <svg className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p className="text-sm">Loading live data...</p>
        </div>
      )}
    </div>
  )
}

export default LivePrice
