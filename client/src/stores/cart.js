import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
  }),
  actions: {
    addToCart(item) {
      const existing = this.items.find((i) => i._id === item._id)
      if (existing) {
        existing.quantity += 1
      } else {
        this.items.push({ ...item, quantity: 1 })
      }
    },
    updateQuantity(id, quantity) {
      const item = this.items.find((i) => i._id === id)
      if (item && quantity > 0) {
        item.quantity = quantity
      }
    },
    removeFromCart(id) {
      this.items = this.items.filter((i) => i._id !== id)
    },
    clearCart() {
      this.items = []
    },
  },

  // get the computed value
  getters: {
    totalItems: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: (state) => state.items.reduce((sum, item) => sum + item.quantity * item.price, 0),
  },
})
