import axios from 'axios'
import { useAuthStore } from '@/store/useAuthStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Request Interceptor — Auto-attach JWT token ──
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response Interceptor — Handle 401 auto-logout ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const originalRequestUrl = error.config?.url || ''
      // Jangan paksa logout jika request berasal dari proses login atau register
      if (originalRequestUrl.includes('/auth/login') || originalRequestUrl.includes('/auth/register')) {
        return Promise.reject(error)
      }

      useAuthStore.getState().logout()
      sessionStorage.setItem('session_expired', 'true')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
