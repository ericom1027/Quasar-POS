import { defineStore } from 'pinia'
import api from '../utils/api'

export const useAttendanceStore = defineStore('attendance', {
  state: () => ({
    attendance: null,
    allAttendance: [],
    loading: false,
    error: null,
    successMessage: null,
  }),

  actions: {
    async fetchTodayAttendance() {
      this.loading = true
      this.error = null
      this.successMessage = null
      try {
        const res = await api.get('/api/getAttendance')
        this.attendance = res.data.attendance
      } catch (error) {
        this.error = error.response?.data?.message || error.message
      } finally {
        this.loading = false
      }
    },

    async fetchAllAttendance() {
      this.loading = true
      this.error = null
      try {
        const res = await api.get('/api/attendance/all')
        this.allAttendance = res.data.attendances
      } catch (error) {
        this.error = error.response?.data?.message || error.message
        console.error('Error:', this.error)
      } finally {
        this.loading = false
      }
    },
  },
})
