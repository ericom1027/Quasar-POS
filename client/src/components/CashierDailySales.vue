<template>
  <q-page class="q-pa-md">
    <q-card flat bordered class="q-pa-md">
      <q-card-section>
        <div class="text-h6">Cashier Daily Sales Report</div>

        <div class="text-subtitle2">
          {{ formatDate(salesData?.date) || 'No date available' }}
        </div>

        <!-- Date picker to select day -->
        <div class="row q-col-gutter-md items-end">
          <q-expansion-item
            label="Select Date"
            icon="filter_list"
            class="q-my-md"
            v-model="datePickerExpanded"
            expand-separator
          >
            <q-date
              v-model="selectedDate"
              landscape
              class="q-pa-sm"
              @update:model-value="onDateChange"
            />
            <div class="q-mt-sm flex justify-end">
              <q-btn label="Clear Filter" color="negative" flat @click="clearFilter" />
            </div>
          </q-expansion-item>
        </div>
      </q-card-section>

      <q-card-section v-if="salesStore.loading">
        <q-spinner color="primary" size="2em" />
      </q-card-section>

      <q-card-section v-else-if="salesStore.error">
        <q-banner dense rounded class="bg-red-3 text-white">
          {{ salesStore.error }}
        </q-banner>
      </q-card-section>

      <q-card-section v-else>
        <q-btn label="Print" color="primary" icon="print" class="q-mb-md" @click="printReport" />
        <q-table
          :rows="salesData?.sales ?? []"
          :columns="columns"
          row-key="cashierName"
          flat
          bordered
          dense
          :loading="salesStore.loading"
          no-data-label="No sales data available."
        >
          <template v-slot:body-cell-totalSales="props">
            ₱{{ Number(props.value || 0).toFixed(2) }}
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { date } from 'quasar'
import { useBillStore } from '../stores/billStore'

const salesStore = useBillStore()

const selectedDate = ref(date.formatDate(Date.now(), 'YYYY-MM-DD'))
const datePickerExpanded = ref(false)

onMounted(() => {
  fetchSalesForDate(selectedDate.value)
})

function onDateChange(newDate) {
  datePickerExpanded.value = false
  salesStore.getCashierDailySales(newDate)
}

function fetchSalesForDate(dateStr) {
  salesStore.getCashierDailySales(dateStr)
}

function clearFilter() {
  selectedDate.value = date.formatDate(Date.now(), 'YYYY-MM-DD')
  fetchSalesForDate(selectedDate.value)
}

const salesData = computed(() => {
  const data = salesStore.cashierDailySales || {}
  return {
    date: selectedDate.value,
    sales: data.sales || [],
    ...data,
  }
})

function formatDate(dateStr) {
  if (!dateStr) return null
  return date.formatDate(dateStr, 'MMMM D, YYYY')
}

function printReport() {
  const salesRows = salesData.value.sales || []

  let rowsHtml = ''
  salesRows.forEach((row) => {
    const itemList =
      row.cartItems?.map((item) => `${item.itemName} (qty${item.qty})`).join(', ') || 'No items'

    rowsHtml += `
    <tr>
      <td>${row.cashierName || ''}</td>
      <td>₱${Number(row.totalSales || 0).toFixed(2)}</td>
      <td style="text-align:center;">${row.transactions || 0}</td>
    </tr>
     <tr>
      <td colspan="3" style="padding-left: 20px; font-size: 0.9em; color: #555;">
        <strong>Items Sold:</strong> ${itemList}
      </td>
    </tr>
  `
  })

  const html = `
    <html>
      <head>
        <title>Cashier Daily Sales Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #000;
          }
          h1, h3 {
            margin: 0 0 10px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          th, td {
            border: 1px solid #333;
            padding: 8px;
          }
          th {
            background-color: #eee;
            text-align: left;
          }
          td {
            vertical-align: top;
          }
        </style>
      </head>
      <body>
        <h1>Cashier Daily Sales Report</h1>
        <h3>${formatDate(salesData.value.date) || 'No date available'}</h3>
        <table>
          <thead>
            <tr>
              <th>Cashier</th>
              <th>Total Sales</th>
              <th style="text-align:center;">Total Transactions</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </body>
    </html>
  `

  const width = 800
  const height = 1100
  const left = window.screenX + (window.outerWidth - width) / 2
  const top = window.screenY + (window.outerHeight - height) / 2

  const printWindow = window.open(
    '',
    '',
    `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`,
  )
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}

const columns = [
  {
    name: 'cashierName',
    label: 'Cashier',
    field: 'cashierName',
    sortable: true,
    align: 'left',
  },

  {
    name: 'totalSales',
    label: 'Total Sales',
    field: 'totalSales',
    sortable: true,
    align: 'left',
  },
  {
    name: 'cartItems',
    label: 'Items Sold',
    field: (row) => row.cartItems.map((item) => `${item.itemName} (qty${item.qty})`).join(', '),
    align: 'left',
  },
  {
    name: 'transactions',
    label: 'Total Transactions',
    field: 'transactions',
    sortable: true,
    align: 'center',
  },
]
</script>
