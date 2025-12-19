import React from 'react'

function StockCard({ data, currency = 'USD', darkMode = false }) {
  const isPositive = data.change >= 0
  const priceUSD = data.currentPrice
  const priceINR = data.currentPriceINR
  const displayPrice = currency === 'INR' ? priceINR : priceUSD
  const prevCloseUSD = data.previousClose
  const prevCloseINR = data.previousCloseINR
  const displayPrevClose = currency === 'INR' ? prevCloseINR : prevCloseUSD
  const high52WUSD = data.fiftyTwoWeekHigh
  const high52WINR = data.fiftyTwoWeekHighINR
  const display52WHigh = currency === 'INR' ? high52WINR : high52WUSD
  const low52WUSD = data.fiftyTwoWeekLow
  const low52WINR = data.fiftyTwoWeekLowINR
  const display52WLow = currency === 'INR' ? low52WINR : low52WUSD
  
  const formatNumber = (num) => {
    if (!num) return 'N/A'
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T'
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
    return num.toLocaleString()
  }

  return (
    <div className={`rounded-xl p-6 ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}`}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{data.symbol}</h2>
            <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-500'}`}>
              {data.exchange}
            </span>
          </div>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>{data.name}</p>
        </div>
        <div className="text-right">
          <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {currency === 'INR' ? '₹' : '$'}{displayPrice?.toLocaleString()}
          </p>
          <div className={`flex items-center justify-end space-x-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            <span className="text-lg font-semibold">
              {isPositive ? '+' : ''}{data.change?.toFixed(2)}
            </span>
            <span className="text-sm">
              ({isPositive ? '+' : ''}{data.changePercent?.toFixed(2)}%)
            </span>
            {isPositive ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`rounded-lg p-3 ${darkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
          <p className={`text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Previous Close</p>
          <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {currency === 'INR' ? '₹' : '$'}{displayPrevClose?.toLocaleString()}
          </p>
        </div>
        <div className={`rounded-lg p-3 ${darkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
          <p className={`text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Market Cap</p>
          <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatNumber(data.marketCap)}</p>
        </div>
        <div className={`rounded-lg p-3 ${darkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
          <p className={`text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>52W High</p>
          <p className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
            {currency === 'INR' ? '₹' : '$'}{display52WHigh?.toLocaleString()}
          </p>
        </div>
        <div className={`rounded-lg p-3 ${darkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
          <p className={`text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>52W Low</p>
          <p className={`font-semibold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
            {currency === 'INR' ? '₹' : '$'}{display52WLow?.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}

export default StockCard
