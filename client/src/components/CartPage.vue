<!-- <template>
  <q-page class="q-pa-md">
   
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
import { ref, computed } from 'vue'
import { useCartStore } from '../stores/cart'
import { useBillStore } from '../stores/billStore'
import { Notify } from 'quasar'

const cartStore = useCartStore()
const billStore = useBillStore()

const showInvoiceModal = ref(false)

const form = ref({
  customerName: '',
  customerNumber: '',
  paymentMode: '',
  cash: 0,
  isSeniorOrPWD: false,
  gcashReferenceNumber: '',
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
</script> -->
