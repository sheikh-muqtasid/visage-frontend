import axios from 'axios'
import authConfig from 'src/configs/auth'

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request Interceptor
axiosInstance.interceptors.request.use(
  config => {
    const accessToken = window.localStorage.getItem(authConfig.storageTokenKeyName)
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Response Interceptor
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // If the error status is 401 and there is no originalRequest._retry flag,
    // it means the token has expired and we need to refresh it
    if (error.response?.status === 401 && !originalRequest._retry && authConfig.onTokenExpiration === 'refreshToken') {
      originalRequest._retry = true

      try {
        const refreshToken = window.localStorage.getItem(authConfig.storageRefreshTokenKeyName)
        
        if (!refreshToken) {
          // No refresh token, force logout
          window.localStorage.removeItem(authConfig.storageTokenKeyName)
          window.localStorage.removeItem('userData')
          // Optional: Force reload or redirect to login (e.g. window.location.href = '/login')
          return Promise.reject(error)
        }

        const response = await axios.post(`${baseURL}${authConfig.refreshEndpoint}`, {
          refreshToken
        })

        const newAccessToken = response.data.accessToken
        const newRefreshToken = response.data.refreshToken

        // Update local storage
        window.localStorage.setItem(authConfig.storageTokenKeyName, newAccessToken)
        if (newRefreshToken) {
          window.localStorage.setItem(authConfig.storageRefreshTokenKeyName, newRefreshToken)
        }

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        // Refresh token failed, clear local storage and force login
        window.localStorage.removeItem(authConfig.storageTokenKeyName)
        window.localStorage.removeItem(authConfig.storageRefreshTokenKeyName)
        window.localStorage.removeItem('userData')
        
        // Let the application layer handle the redirect to login
        if (typeof window !== 'undefined') {
          window.location.replace('/login')
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
