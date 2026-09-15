import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to automatically attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 Unauthorized and not already on the auth page, token may be invalid/expired
    if (error.response && error.response.status === 401) {
      const isAuthEndpoint = error.config.url?.includes('/auth/login') || error.config.url?.includes('/auth/register')
      if (!isAuthEndpoint) {
        localStorage.removeItem('token')
      }
    }
    return Promise.reject(error)
  }
)

export default api
