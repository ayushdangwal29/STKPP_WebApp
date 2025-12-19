import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

function PredictionPanel({ prediction }) {
  if (!prediction) return null

  const chartData = prediction.predictions.map(p => ({
    date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    predicted: p.predictedPrice,
    low: p.lowBound,
    high: p.highBound,
    confidence: p.confidence
  }))

  const getRecommendationColor = (rec) => {
    switch (rec) {
      case 'BUY': return 'text-green-700 bg-green-100 border-green-200'
      case 'SELL': return 'text-red-700 bg-red-100 border-red-200'
      default: return 'text-yellow-700 bg-yellow-100 border-yellow-200'
    }
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
          <p className="font-semibold text-gray-900 mb-2">{item.date}</p>
          <div className="space-y-1 text-sm">
            <p><span className="text-gray-500">Predicted:</span> <span className="font-medium text-primary-600">${item.predicted}</span></p>
            <p><span className="text-gray-500">Range:</span> <span className="font-medium">${item.low} - ${item.high}</span></p>
            <p><span className="text-gray-500">Confidence:</span> <span className="font-medium">{(item.confidence * 100).toFixed(0)}%</span></p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl border ${getRecommendationColor(prediction.recommendation)}`}>
          <p className="text-sm font-medium mb-1">Recommendation</p>
          <p className="text-2xl font-bold">{prediction.recommendation}</p>
          <p className="text-xs mt-1 opacity-75">{prediction.recommendationDetail}</p>
        </div>
        
        <div className="p-4 rounded-xl bg-gray-50">
          <p className="text-sm text-gray-500 mb-1">Expected Change</p>
          <p className={`text-2xl font-bold ${prediction.overallChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {prediction.overallChange >= 0 ? '+' : ''}{prediction.overallChange.toFixed(2)}%
          </p>
          <p className="text-xs text-gray-400 mt-1">Over {prediction.predictions.length} trading days</p>
        </div>
        
        <div className="p-4 rounded-xl bg-gray-50">
          <p className="text-sm text-gray-500 mb-1">Market Sentiment</p>
          <div className="flex items-center space-x-2">
            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                style={{ width: `${prediction.sentiment * 100}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium">{(prediction.sentiment * 100).toFixed(0)}%</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {prediction.sentiment > 0.6 ? 'Bullish' : prediction.sentiment < 0.4 ? 'Bearish' : 'Neutral'}
          </p>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-4">Technical Indicators</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">SMA (5)</p>
            <p className="font-semibold text-gray-900">${prediction.indicators.sma_5}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">SMA (20)</p>
            <p className="font-semibold text-gray-900">${prediction.indicators.sma_20}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">RSI</p>
            <p className={`font-semibold ${
              prediction.indicators.rsi > 70 ? 'text-red-600' : 
              prediction.indicators.rsi < 30 ? 'text-green-600' : 'text-gray-900'
            }`}>{prediction.indicators.rsi}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">Volatility</p>
            <p className="font-semibold text-gray-900">{prediction.indicators.volatility}%</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">Momentum</p>
            <p className={`font-semibold ${prediction.indicators.momentum >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {prediction.indicators.momentum >= 0 ? '+' : ''}{prediction.indicators.momentum}%
            </p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-4">Price Prediction Chart</h4>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="predicted" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                fill="url(#colorPredicted)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-4">Daily Predictions</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-3 font-medium text-gray-500">Date</th>
                <th className="pb-3 font-medium text-gray-500">Predicted Price</th>
                <th className="pb-3 font-medium text-gray-500">Range</th>
                <th className="pb-3 font-medium text-gray-500">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {prediction.predictions.map((p, idx) => (
                <tr key={idx} className="border-b border-gray-50">
                  <td className="py-3 text-gray-900">{p.date}</td>
                  <td className="py-3 font-semibold text-primary-600">${p.predictedPrice}</td>
                  <td className="py-3 text-gray-600">${p.lowBound} - ${p.highBound}</td>
                  <td className="py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-500 rounded-full"
                          style={{ width: `${p.confidence * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-600">{(p.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PredictionPanel
