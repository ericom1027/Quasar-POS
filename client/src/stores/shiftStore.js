import { defineStore } from 'pinia'
import api from '../utils/api'
import { notifySuccess, notifyError } from '../utils/notify'

export const useShiftStore = defineStore('shift', {
  state: () => ({
    shifts: [],
    loading: false,
    error: null,
  }),

  actions: {
    async openShift({ startingCash }) {
      try {
        const { data } = await api.post('/api/openShift', { startingCash })

        this.shifts = data.shift
        localStorage.setItem('hasOpenedShift', 'true')

        localStorage.setItem('hasClosedShift', 'false')

        notifySuccess(data.message || 'Shift opened successfully!')
      } catch (error) {
        console.error('Failed to open shift:', error.response?.data)
        notifyError(error.response?.data?.error || 'Failed to open shift.')
      }
    },

    async closeShift({ endingCash }) {
      try {
        const { data } = await api.put('/api/closeShift', { endingCash })
        this.shifts = data
        localStorage.setItem('hasClosedShift', 'true')
        notifySuccess('Shift closed successfully!')
      } catch (error) {
        console.error('Failed to close shift:', error)
        notifyError(error.response?.data?.error || 'Failed to close shift.')
      }
    },

    async fetchShifts() {
      try {
        this.loading = true
        const res = await api.get('/api/getShifts')
        this.shifts = res.data
      } catch (err) {
        this.error = err.response?.data?.error || 'Failed to fetch shifts'
      } finally {
        this.loading = false
      }
    },
  },
})
