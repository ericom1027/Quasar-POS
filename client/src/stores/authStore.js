import { defineStore } from 'pinia'
import api from '../utils/api'
import { notifySuccess, notifyError } from '../utils/notify'

export const useAuthStore = defineStore('auth', {
  state: () => {
    let user = null

    try {
      const storedUser = localStorage.getItem('user')
      user = storedUser ? JSON.parse(storedUser) : null
    } catch (error) {
      console.error('Error parsing user from localStorage:', error)
      localStorage.removeItem('user')
    }

    return {
      user,
      accessToken: localStorage.getItem('accessToken') || null,
      attendance: null,
    }
  },
  actions: {
    async login(email, password) {
      try {
        const { data } = await api.post('/api/login', { email, password })

        if (data && data.user) {
          this.user = data.user
          this.accessToken = data.accessToken
          localStorage.setItem('user', JSON.stringify(data.user))
          localStorage.setItem('accessToken', data.accessToken)
          this.attendance = data.attendance || null

          const isAdmin = data.user.isAdmin === true
          localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false')

          localStorage.removeItem('hasOpenedShift')
          localStorage.removeItem('hasClosedShift')

          notifySuccess('Login successful!')
        } else {
          console.error('Invalid API response:', data)
          notifyError('Invalid login response.')
        }
      } catch (error) {
        console.error('Login failed', error)
        notifyError('Login failed. Please check your credentials.')
        throw error
      }
    },

    async refreshAccessToken() {
      try {
        const { data } = await api.post('/api/refresh')
        this.accessToken = data.accessToken
        localStorage.setItem('accessToken', data.accessToken)
      } catch (error) {
        console.error('Failed to refresh token:', error)
        this.logout()
      }
    },

    async logout() {
      const isAdmin = localStorage.getItem('isAdmin') === 'true'

      if (!isAdmin) {
        const hasOpenedShift = localStorage.getItem('hasOpenedShift') === 'true'
        const hasClosedShift = localStorage.getItem('hasClosedShift') === 'true'

        if (hasOpenedShift && !hasClosedShift) {
          notifyError('Close your shift before logout.')
          return
        }
      }

      try {
        await api.post('/api/logout')
      } catch (error) {
        console.error('Logout failed:', error)
        if (!isAdmin) {
          notifyError('Failed to record attendance logout.')
        }
      } finally {
        this.user = null
        this.accessToken = null

        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        localStorage.removeItem('isAdmin')
        localStorage.removeItem('hasOpenedShift')
        localStorage.removeItem('hasClosedShift')
        window.location.href = '/'
      }
    },
  },
})
