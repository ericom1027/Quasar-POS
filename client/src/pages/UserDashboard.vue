<template>
  <q-page class="q-pa-md">
    <div class="row">
      <div class="col">
        <div class="q-mb-md">
          <q-btn
            v-for="category in categories"
            :key="category"
            :label="category"
            :color="category === selectedCategory ? 'primary' : 'grey'"
            class="q-mr-sm"
            flat
            dense
            @click="selectedCategory = category"
          />
        </div>

        <div class="row q-col-gutter-sm">
          <div v-for="item in filteredItems" :key="item._id" class="col-xs-12 col-sm-4 col-md-3">
            <q-card
              flat
              bordered
              class="bg-grey-1 no-caret"
              style="min-height: 200px"
              @click="addToCart(item)"
            >
              <div
                style="
                  height: 100px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background-color: #f9f9f9;
                "
              >
                <q-img
                  :src="getImageUrl(item.image)"
                  alt="Item Image"
                  style="max-height: 100%; max-width: 100%; object-fit: contain"
                  no-spinner
                  no-transition
                />
              </div>
              <q-card-section style="padding: 8px">
                <div class="text-subtitle2 text-bold" style="line-height: 1.1">
                  {{ item.itemName }}
                </div>
                <div v-if="item.size" class="text-caption text-grey" style="margin-top: 2px">
                  Size: {{ item.size }}
                </div>
                <div class="text-subtitle2 text-primary" style="margin-top: 4px">
                  ₱ {{ item.price.toFixed(2) }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Right Side: Cart Drawer always visible -->
      <div v-if="drawerOpen" class="col-auto" style="width: 320px">
        <q-card flat class="bg-white shadow-2" style="flex-grow: 1">
          <q-card-section>
            <div class="row items-center q-gutter-sm" style="font-size: 1.25rem">
              <q-icon name="shopping_cart" size="24px" />
              <span>Cart Order List ({{ cartStore.totalItems }})</span>
              <q-btn dense flat icon="close" @click="drawerOpen = false" />
            </div>

            <div v-for="item in cartStore.items" :key="item._id" class="q-pa-sm q-gutter-sm">
              <div class="row items-center">
                <div class="col-6">{{ item.itemName }} - ₱{{ item.price.toFixed(2) }}</div>
                <div class="col-3">
                  <q-input
                    dense
                    v-model.number="item.quantity"
                    type="number"
                    min="1"
                    @change="cartStore.updateQuantity(item._id, item.quantity)"
                  />
                </div>
                <div class="col-3 text-right">
                  <q-btn
                    dense
                    color="red"
                    icon="delete"
                    @click="cartStore.removeFromCart(item._id)"
                  />
                </div>
              </div>
            </div>

            <div class="q-mt-md text-right">
              <div class="text-subtitle1">Total: ₱{{ cartStore.totalPrice.toFixed(2) }}</div>
              <q-btn
                label="Proceed to Checkout"
                color="primary"
                class="q-mt-sm"
                @click="showInvoiceModal = true"
                :disable="cartStore.items.length === 0"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Invoice Modal -->
    <q-dialog v-model="showInvoiceModal" persistent>
      <q-card style="min-width: 500px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Invoice Details</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="form.customerName"
            label="Customer Name"
            dense
            outlined
            class="q-mb-sm"
          />
          <q-input
            v-model="form.customerNumber"
            label="Customer Number"
            dense
            outlined
            class="q-mb-sm"
          />
          <q-select
            v-model="form.paymentMode"
            :options="['Cash', 'GCash']"
            label="Payment Mode"
            dense
            outlined
            class="q-mb-sm"
          />
          <q-input
            v-if="form.paymentMode === 'GCash'"
            v-model="form.gcashReferenceNumber"
            label="GCash Reference Number"
            dense
            outlined
            class="q-mb-sm"
            clearable
          />
          <q-toggle
            v-model="form.isSeniorOrPWD"
            label="Senior Citizen / PWD (20% discount)"
            class="q-mb-sm"
          />
          <q-input
            v-model.number="form.cash"
            label="Cash Tendered"
            type="number"
            dense
            outlined
            class="q-mb-sm"
          />
        </q-card-section>

        <div class="q-gutter-sm q-ml-md">
          <div class="text-body2">Subtotal: ₱{{ subTotal.toFixed(2) }}</div>
          <div class="text-body2">VAT Sales: ₱{{ vatSales.toFixed(2) }}</div>
          <div class="text-body2">VAT Amount (12%): ₱{{ vatAmount.toFixed(2) }}</div>
          <div class="text-body2" v-if="form.isSeniorOrPWD">
            Discount (20%): ₱{{ discount.toFixed(2) }}
          </div>
          <div class="text-subtitle1">Total Amount: ₱{{ totalAmount.toFixed(2) }}</div>
          <div class="text-body2">Cash Tendered: ₱{{ form.cash.toFixed(2) }}</div>
          <div class="text-body2">Change: ₱{{ change.toFixed(2) }}</div>
        </div>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            label="Checkout"
            color="positive"
            @click="confirmCheckout"
            :disable="
              cartStore.items.length === 0 ||
              (form.paymentMode === 'Cash' && form.cash < totalAmount)
            "
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useItemsStore } from '../stores/items'
import { useCartStore } from '../stores/cart'
import { useBillStore } from '../stores/billStore'
import { Notify } from 'quasar'

const cartStore = useCartStore()
const itemsStore = useItemsStore()
const billStore = useBillStore()

const drawerOpen = ref(false)
const showInvoiceModal = ref(false)

const form = ref({
  customerName: '',
  customerNumber: '',
  paymentMode: '',
  cash: 0,
  isSeniorOrPWD: false,
  gcashReferenceNumber: '',
})

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

onMounted(() => {
  itemsStore.fetchItems()
})

function getImageUrl(image) {
  if (!image) return 'https://via.placeholder.com/150'
  return `${BACKEND_URL}/uploads/${image}?t=${Date.now()}`
}

function addToCart(item) {
  cartStore.addToCart(item)
  Notify.create({ type: 'positive', message: `${item.itemName} added to cart.` })
  drawerOpen.value = true
}

const categories = computed(() => {
  const cats = new Set()
  itemsStore.items.forEach((item) => {
    let cat = item.category ? item.category.trim() : 'Uncategorized'
    cats.add(cat)
  })
  return ['All', ...cats]
})

const selectedCategory = ref('All')

const filteredItems = computed(() => {
  if (selectedCategory.value === 'All') return itemsStore.items
  return itemsStore.items.filter(
    (item) =>
      item.category &&
      item.category.trim().toLowerCase() === selectedCategory.value.trim().toLowerCase(),
  )
})

const subTotal = computed(() =>
  cartStore.items.reduce((sum, item) => sum + item.quantity * item.price, 0),
)
const vatAmount = computed(() => subTotal.value * 0.12)
const vatSales = computed(() => subTotal.value - vatAmount.value)
const discount = computed(() => (form.value.isSeniorOrPWD ? subTotal.value * 0.2 : 0))
const totalAmount = computed(() => subTotal.value - discount.value)
const change = computed(() => form.value.cash - totalAmount.value)

const confirmCheckout = async () => {
  if (form.value.paymentMode === 'GCash' && !form.value.gcashReferenceNumber.trim()) {
    Notify.create({
      type: 'negative',
      message: 'Reference number is required for GCash payments.',
    })
    return
  }

  try {
    const billData = {
      customerName: form.value.customerName,
      customerNumber: form.value.customerNumber,
      paymentMode: form.value.paymentMode.toLowerCase(),
      gcashReferenceNumber:
        form.value.paymentMode === 'GCash' ? form.value.gcashReferenceNumber : '',
      cash: form.value.cash,
      isSeniorOrPWD: form.value.isSeniorOrPWD,
      cartItems: cartStore.items.map((item) => ({
        itemName: item.itemName,
        price: item.price,
        qty: item.quantity,
      })),
    }

    await billStore.submitBill(billData)

    showInvoiceModal.value = false
    cartStore.clearCart()
    Notify.create({
      type: 'positive',
      position: 'bottom-right',
      message: 'Invoice successfully saved.',
    })
  } catch (error) {
    console.error(error)
    const errorMessage =
      typeof billStore.error === 'string'
        ? billStore.error
        : error?.message || 'Failed to save invoice.'
    Notify.create({ type: 'negative', position: 'bottom-right', message: errorMessage })
  }
}
</script>
