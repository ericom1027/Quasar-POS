<template>
  <q-page class="q-pa-md">
    <div
      style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      "
    >
      <h2 class="text-h5 q-mb-md">List of Bills</h2>

      <q-input
        v-model="searchTerm"
        label="Search by Receipt No."
        outlined
        dense
        debounce="300"
        clearable
        style="max-width: 300px"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <div v-if="loading" class="q-my-md flex justify-center">
      <q-spinner color="primary" size="40px" />
    </div>

    <!-- <q-banner v-if="error" class="bg-red-2 text-red q-mb-md">
      {{ error }}
    </q-banner> -->

    <q-table
      v-if="!loading && filteredBills && filteredBills.length"
      :rows="filteredBills"
      :columns="columns"
      row-key="id"
      flat
      bordered
      separator="horizontal"
      class="q-mt-md"
    >
      <template v-slot:body-cell-items="props">
        <q-td>
          <ul class="q-pl-sm q-my-none">
            <li v-for="(item, idx) in props.row.cartItems" :key="idx">
              {{ item.itemName }} (x{{ item.qty }})
            </li>
          </ul>
        </q-td>
      </template>

      <template v-slot:body-cell-subTotal="props">
        <q-td>{{ props.row.subTotal.toFixed(2) }}</q-td>
      </template>
      <template v-slot:body-cell-vatSales="props">
        <q-td>{{ props.row.vatSales.toFixed(2) }}</q-td>
      </template>
      <template v-slot:body-cell-vatAmount="props">
        <q-td>{{ props.row.vatAmount.toFixed(2) }}</q-td>
      </template>
      <template v-slot:body-cell-cash="props">
        <q-td>{{ props.row.cash.toFixed(2) }}</q-td>
      </template>
      <template v-slot:body-cell-change="props">
        <q-td>{{ props.row.change.toFixed(2) }}</q-td>
      </template>
      <template v-slot:body-cell-totalAmount="props">
        <q-td>{{ props.row.totalAmount.toFixed(2) }}</q-td>
      </template>
      <template v-slot:body-cell-isSeniorOrPWD="props">
        <q-td>{{ props.row.isSeniorOrPWD ? 'Yes' : 'No' }}</q-td>
      </template>

      <template v-slot:body-cell-voided="props">
        <q-td :props="props">
          <q-badge
            :color="props.row.voided ? 'red' : 'green'"
            :label="props.row.voided ? 'Voided' : 'Active'"
            align="center"
            dense
          />
        </q-td>
      </template>

      <template v-slot:body-cell-print="props">
        <q-td align="center">
          <q-btn
            dense
            flat
            icon="print"
            color="primary"
            :disable="props.row.voided"
            @click="printReceipt(props.row)"
            size="md"
          />

          <q-btn
            v-if="user?.isAdmin"
            dense
            flat
            icon="cancel"
            color="negative"
            size="md"
            @click="handleVoid(props.row.invoiceNumber)"
            label="Void"
          />
        </q-td>
      </template>
    </q-table>

    <div
      v-else-if="!loading && filteredBills && filteredBills.length === 0"
      class="text-grey text-center q-mt-md"
    >
      No matching Receipt No found.
    </div>

    <div v-else-if="!loading && bills && bills.length === 0" class="text-grey text-center q-mt-md">
      No bills found.
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBillStore } from '../stores/billStore'
import { useAuthStore } from '../stores/authStore'
import { Notify } from 'quasar'

const authStore = useAuthStore()
const { user } = authStore
const searchTerm = ref('')

const billStore = useBillStore()

const bills = computed(() => billStore.bills)
const loading = computed(() => billStore.loading)
// const error = computed(() => billStore.error)

const filteredBills = computed(() => {
  if (!searchTerm.value) return bills.value
  return bills.value.filter((b) =>
    b.invoiceNumber.toLowerCase().includes(searchTerm.value.toLowerCase()),
  )
})

function printReceipt(bill) {
  const width = 300
  const height = 400
  const left = window.screenX + (window.outerWidth - width) / 2
  const top = window.screenY + (window.outerHeight - height) / 2

  const date = new Date(bill.date || bill.createdAt || Date.now())
  const formattedDate = date.toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const receiptWindow = window.open(
    '',
    'Print Receipt',
    `width=${width},height=${height},top=${top},left=${left},resizable=no`,
  )
  // const receiptWindow = window.open('', 'Print Receipt', 'width=300,height=400')
  receiptWindow.document.write(`
    <html>
      <head>
        <title>Receipt - Invoice #${bill.invoiceNumber}</title>
      <style>
  @media print {
    html, body {
      width: 80mm;
      margin: 0;
      padding: 0;
      font-size: 16px;
      page-break-after: auto;
    }

    * {
      box-sizing: border-box;
    }
  }

  body {
    font-family: monospace;
    font-size: 13.3px;
    width: 80mm;
    padding: 0.5mm 3mm 3mm 3mm;
    margin: 0;
  }

  .center {
    text-align: center;
  }

  .line {
    border-top: 1px dashed #000;
    margin: 5px 0;
  }

  .items, .totals {
    margin: 5px 0;
  }

  .footer {
    margin-top: 10px;
    text-align: center;
  }
</style>

      </head>
      <body>
        <div class="center">
          <div>**RAZON'S OF MALOLOS**</div>
          <div>Unit 7 Twinz Plaza, Bulihan</div>
           <div>MacArthur Highway, Malolos, Bulacan</div>
          <div>Contact No: 0951-544-3604</div>
        </div>

        <div class="line"></div>

        <div><strong>Invoice:</strong> ${bill.invoiceNumber}</div>
         <div><strong>Date:</strong> ${formattedDate}</div>
         <div><strong>Cashier:</strong> ${bill.cashierName}</div>
         <div><strong>Customer Name:</strong> ${bill.customerName}</div>
        <div><strong>Customer No.:</strong> ${bill.customerNumber}</div>
       <div><strong>Payment Mode:</strong> ${bill.paymentMode}</div>
       ${bill.paymentMode === 'GCash' ? `<div><strong>GCash Ref:</strong> ${bill.gcashReferenceNumber}</div>` : ''}
        <div><strong>GCash Ref:</strong> ${bill.gcashReferenceNumber}</div>
        <div class="line"></div>

        <div class="items">
          ${bill.cartItems
            .map(
              (item) => `
            <div>
              ${item.itemName}<br/>
              x${item.qty}
            </div>
          `,
            )
            .join('')}
        </div>

        <div class="line"></div>

        <div>Subtotal:    PHP${bill.subTotal.toFixed(2)}</div>
        <div>VAT Sales:    PHP${bill.vatSales.toFixed(2)}</div>
        <div>VAT Amount:   PHP${bill.vatAmount.toFixed(2)}</div>
        <div>Discount(20%): PHP${bill.discount.toFixed(2)}</div>
        <div>Total Amount:        PHP${bill.totalAmount.toFixed(2)}</div>
        <div>Cash Tendered:         PHP${bill.cash.toFixed(2)}</div>
        <div>Change:       PHP${bill.change.toFixed(2)}</div>
         <div>Senior/PWD:   ${bill.seniorOrPWD ? 'Yes' : 'No'}</div>

        <div class="line"></div>

        <div class="footer">
          Thank you for your purchase!<br/>
          This is a temporary receipt. Please keep it for your records.
        </div>
      </body>
    </html>
  `)
  receiptWindow.document.close()
  receiptWindow.focus()
  receiptWindow.print()
}

onMounted(() => {
  billStore.getBills()
})

const handleVoid = async (invoiceNumber) => {
  try {
    await billStore.voidBill(invoiceNumber)
    await billStore.getBills()
    Notify.create({
      type: 'positive',
      position: 'bottom-right',
      message: 'Bill voided successfully!',
    })
  } catch (err) {
    Notify.create({ type: 'negative', position: 'bottom-right', message: err.message })
  }
}

const columns = [
  { name: 'invoiceNumber', label: 'Invoice No.', field: 'invoiceNumber', align: 'left' },
  { name: 'items', label: 'Items', field: 'cartItems', align: 'left' },
  { name: 'cash', label: 'Cash Tendered (₱)', field: 'cash', align: 'left' },
  { name: 'change', label: 'Change (₱)', field: 'change', align: 'left' },
  { name: 'totalAmount', label: 'Total Amount (₱)', field: 'totalAmount', align: 'left' },
  {
    name: 'voided',
    label: 'Status',
    field: 'voided',
    format: (val) => (val ? 'Voided' : 'Active'),
  },
  { name: 'print', label: 'Print', field: 'print', align: 'center', sortable: false },
]
</script>

<style scoped>
ul {
  margin: 0;
  padding-left: 10px;
}
</style>
