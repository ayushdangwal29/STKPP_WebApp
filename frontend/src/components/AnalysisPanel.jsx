import React from 'react'

function AnalysisPanel({ analysis }) {
  if (!analysis) return null

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'Bullish': return 'text-green-700 bg-green-100'
      case 'Bearish': return 'text-red-700 bg-red-100'
      default: return 'text-yellow-700 bg-yellow-100'
    }
  }

  const formatNumber = (num) => {
    if (!num) return 'N/A'
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'
    return num.toLocaleString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{analysis.symbol}</h3>
          <p className="text-gray-500">{analysis.name}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(analysis.sentiment)}`}>
          {analysis.sentiment}
        </span>
      </div>

      <div className="p-5 bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl border border-primary-100">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">AI Analysis</h4>
            <p className="text-gray-700 leading-relaxed">{analysis.analysis}</p>
          </div>
        </div>
      </div>

      {analysis.metrics && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Performance Metrics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Average Price</p>
              <p className="text-lg font-semibold text-gray-900">${analysis.metrics.averagePrice}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Highest Price</p>
              <p className="text-lg font-semibold text-green-700">${analysis.metrics.highestPrice}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Lowest Price</p>
              <p className="text-lg font-semibold text-red-700">${analysis.metrics.lowestPrice}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Price Range</p>
              <p className="text-lg font-semibold text-gray-900">${analysis.metrics.priceRange}</p>
            </div>
          </div>
        </div>
      )}

      {analysis.metrics && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Trading Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Avg Daily Return</p>
              <p className={`text-lg font-semibold ${analysis.metrics.averageDailyReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analysis.metrics.averageDailyReturn >= 0 ? '+' : ''}{analysis.metrics.averageDailyReturn}%
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Volatility</p>
              <p className="text-lg font-semibold text-gray-900">{analysis.metrics.volatility}%</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Win Rate</p>
              <p className={`text-lg font-semibold ${analysis.metrics.winRate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                {analysis.metrics.winRate}%
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Avg Volume</p>
              <p className="text-lg font-semibold text-gray-900">{formatNumber(analysis.metrics.averageVolume)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-400 pt-4 border-t border-gray-100">
        <p>Analysis generated at {new Date(analysis.generatedAt).toLocaleString()}</p>
        <p>Trading days analyzed: {analysis.metrics?.totalTradingDays || 'N/A'}</p>
      </div>
    </div>
  )
}

export default AnalysisPanel
