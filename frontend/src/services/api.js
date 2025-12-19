import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL is not defined')
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const searchStocks = async (query) => {
  try {
    const response = await api.get(
      `/stock/search?q=${encodeURIComponent(query)}`
    )
    if (!response?.data) {
      throw new Error('Empty response from server')
    }
    return response.data.results
  } catch (error) {
    console.error('searchStocks error:', error)
    throw new Error(
      error.response?.data?.error ||
      'Service temporarily unavailable'
    )
  }
}

export const fetchStockData = async (symbol, period = '1mo') => {
  try {
    const response = await api.get(
      `/stock/${symbol}?period=${period}`
    )
    if (!response?.data) {
      throw new Error('Empty response from server')
    }
    return response.data
  } catch (error) {
    console.error('fetchStockData error:', error)
    throw new Error(
      error.response?.data?.error ||
      'Service temporarily unavailable'
    )
  }
}

export const fetchLivePrice = async (symbol) => {
  try {
    const response = await api.get(`/stock/${symbol}/live`)
    if (!response?.data) {
      throw new Error('Empty response from server')
    }
    return response.data
  } catch (error) {
    console.error('fetchLivePrice error:', error)
    throw new Error(
      error.response?.data?.error ||
      'Service temporarily unavailable'
    )
  }
}

export const fetchPrediction = async (symbol, days = 7) => {
  try {
    const response = await api.get(
      `/stock/${symbol}/predict?days=${days}`
    )
    if (!response?.data) {
      throw new Error('Empty response from server')
    }
    return response.data
  } catch (error) {
    console.error('fetchPrediction error:', error)
    throw new Error(
      error.response?.data?.error ||
      'Service temporarily unavailable'
    )
  }
}

export const fetchAnalysis = async (symbol) => {
  try {
    const response = await api.get(`/stock/${symbol}/analyze`)
    if (!response?.data) {
      throw new Error('Empty response from server')
    }
    return response.data
  } catch (error) {
    console.error('fetchAnalysis error:', error)
    throw new Error(
      error.response?.data?.error ||
      'Service temporarily unavailable'
    )
  }
}

export const fetchNseStocks = async () => {
  try {
    const response = await api.get('/nse/stocks')
    if (!response?.data) {
      throw new Error('Empty response from server')
    }
    return response.data.stocks
  } catch (error) {
    console.error('fetchNseStocks error:', error)
    throw new Error(
      error.response?.data?.error ||
      'Service temporarily unavailable'
    )
  }
}
