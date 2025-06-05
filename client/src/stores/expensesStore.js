import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../utils/api'

export const useExpensesStore = defineStore('expenses', () => {
  const expenses = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchExpenses() {
    loading.value = true
    error.value = null
    try {
      const res = await api.get('/api/expenses')
      expenses.value = res.data
    } catch (err) {
      error.value = err.message || 'Failed to fetch expenses'
    } finally {
      loading.value = false
    }
  }

  async function addExpense(expense) {
    const res = await api.post('/api/expenses', expense)
    expenses.value.push(res.data.expense)
  }

  async function editExpense(id, updatedExpense) {
    const res = await api.put(`/api/expenses/${id}`, updatedExpense)
    const index = expenses.value.findIndex((e) => e._id === id)
    if (index !== -1) {
      expenses.value[index] = res.data.expense
    }
  }

  async function deleteExpense(id) {
    await api.delete(`/api/expenses/${id}`)
    expenses.value = expenses.value.filter((e) => e._id !== id)
  }

  return {
    expenses,
    loading,
    error,
    fetchExpenses,
    addExpense,
    editExpense,
    deleteExpense,
  }
})
