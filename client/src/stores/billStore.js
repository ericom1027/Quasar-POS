import { defineStore } from 'pinia'
import api from '../utils/api'

export const useBillStore = defineStore('bill', {
  state: () => ({
    bills: [],
    loading: false,
    error: null,

    dailySales: null,
    weeklySales: null,
    monthlySales: null,

    dailySalesGraph: [],
    monthlySalesGraph: [],

    cashierDailySales: null,
    dailyItemsSoldReport: null,
  }),

  actions: {
    async submitBill(billData) {
      this.loading = true
      this.error = null

      try {
        const res = await api.post('/api/addBills', billData)
        await this.getBills()
        return res.data
      } catch (err) {
        const errorMessage =
          typeof err.response?.data?.error === 'string'
            ? err.response.data.error
            : err.message || 'Something went wrong'

        this.error = errorMessage
        throw new Error(errorMessage)
      } finally {
        this.loading = false
      }
    },

    async getBills() {
      this.loading = true
      this.error = null

      try {
        const res = await api.get('/api/getBills')
        this.bills = res.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message
      } finally {
        this.loading = false
      }
    },

    async getDailySales(date) {
      this.loading = true
      this.error = null

      try {
        let url = '/api/daily-sales'
        if (date) {
          url += `?date=${date}`
        }
        const res = await api.get(url)
        this.dailySales = res.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message
      } finally {
        this.loading = false
      }
    },

    async getWeeklySales() {
      this.loading = true
      this.error = null

      try {
        const res = await api.get('/api/weekly')
        this.weeklySales = res.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message
      } finally {
        this.loading = false
      }
    },

    async getMonthlySales(month = null) {
      this.loading = true
      this.error = null
      try {
        const year = new Date().getFullYear()
        const params = month ? { month, year } : {}
        const res = await api.get('/api/monthly', { params })
        this.monthlySales = res.data
      } catch (err) {
        this.error = 'Failed to fetch monthly sales'
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async getDailySalesGraph() {
      this.loading = true
      this.error = null

      try {
        const res = await api.get('/api/daily-sales-graph')
        this.dailySalesGraph = res.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message
      } finally {
        this.loading = false
      }
    },

    async getMonthlySalesGraph() {
      this.loading = true
      this.error = null

      try {
        const res = await api.get('/api/monthly-sales-graph')
        this.monthlySalesGraph = res.data
      } catch (err) {
        this.error = err.response?.data?.error || err.message
      } finally {
        this.loading = false
      }
    },

    async getCashierDailySales(date) {
      this.loading = true
      this.error = null
      try {
        const res = await api.get(`/api/sales-cashier?date=${date}`)
        this.cashierDailySales = res.data
      } catch (err) {
        this.error = err.response?.data?.error || 'Something went wrong.'
        this.cashierDailySales = null
      } finally {
        this.loading = false
      }
    },

    async getDailyItemsSoldReport(date) {
      this.loading = true
      this.error = null
      try {
        let url = '/api/daily-items-sold'
        if (date) {
          url += `?date=${date}`
        }
        const res = await api.get(url)
        this.dailyItemsSoldReport = res.data
      } catch (err) {
        this.error = err.response?.data?.error || 'Failed to fetch report'
      } finally {
        this.loading = false
      }
    },

    async voidBill(invoiceNumber) {
      this.loading = true
      this.error = null

      try {
        const res = await api.put(`/api/void/${invoiceNumber}`)
        await this.getBills()
        return res.data
      } catch (err) {
        const errorMessage =
          typeof err.response?.data?.error === 'string'
            ? err.response.data.error
            : err.message || 'Failed to void bill'

        this.error = errorMessage
        throw new Error(errorMessage)
      } finally {
        this.loading = false
      }
    },
  },
})
