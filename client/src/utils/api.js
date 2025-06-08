import axios from 'axios'

const api = axios.create({
  // baseURL: 'http://localhost:4000',
  baseURL: 'https://razons-pos.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

const getAccessToken = () => localStorage.getItem('accessToken')

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const res = await api.post('/api/refresh')
        const newAccessToken = res.data.accessToken

        localStorage.setItem('accessToken', newAccessToken)
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        return api(originalRequest)
      } catch {
        console.error('Refresh token expired. Please login again.')
        localStorage.removeItem('accessToken')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  },
)

export default api
