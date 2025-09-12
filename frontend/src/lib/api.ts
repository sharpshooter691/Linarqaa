import axios from 'axios'

const baseURL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080/api'

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('🔐 API Request with token:', config.url, 'Token present:', !!token)
    } else {
      console.warn('⚠️ API Request without token:', config.url)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login on unauthorized
      localStorage.removeItem('jwt-token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api 