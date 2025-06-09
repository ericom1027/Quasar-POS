<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section class="q-gutter-md">
        <div class="row q-col-gutter-md items-end">
          <q-expansion-item
            v-model="filterOpen"
            label="Select Date"
            icon="filter_list"
            class="q-my-md"
          >
            <q-card class="q-pa-md">
              <q-date landscape v-model="selectedDate" @update:model-value="loadReport" />
              <div class="q-mt-sm flex justify-end">
                <q-btn label="Clear Filter" color="negative" flat @click="clearFilter" />
              </div>
            </q-card>
          </q-expansion-item>

          <q-card-section>
            <q-card-section class="q-pa-sm row justify-end">
              <q-btn
                color="secondary"
                label="Refresh"
                icon="refresh"
                @click="loadReport"
                :loading="loading"
              />

              <q-btn
                icon="print"
                class="q-ml-sm"
                label="Print"
                color="primary"
                @click="printItemsSoldReport"
              />
            </q-card-section>
          </q-card-section>
        </div>
      </q-card-section>

      <q-card-section>
        <q-table
          flat
          bordered
          title="Daily Items Sold"
          :rows="reportData"
          :columns="columns"
          row-key="itemName"
          :loading="loading"
        >
          <template v-slot:bottom>
            <div class="q-pa-sm text-weight-bold">
              TOTAL QTY: {{ totalQty }} | TOTAL SALES: ₱{{ totalSales.toFixed(2) }}
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useBillStore } from '../stores/billStore'
import { date } from 'quasar'
const store = useBillStore()
const filterOpen = ref(false)

const selectedDate = ref(date.formatDate(new Date(), 'YYYY-MM-DD'))
const loading = computed(() => store.loading)
const report = computed(() => store.dailyItemsSoldReport)

const reportData = computed(() => report.value?.items || [])
const totalQty = computed(() => report.value?.overallTotalQty || 0)
const totalSales = computed(() => report.value?.overallTotalSales || 0)

const columns = [
  {
    name: 'date',
    label: 'Date',
    align: 'left',
    field: () => selectedDate.value,
    format: (val) => val,
  },
  { name: 'itemName', label: 'Item', align: 'left', field: 'itemName' },
  { name: 'price', label: 'Price', align: 'left', field: (row) => row.price.toFixed(2) },
  { name: 'totalQty', label: 'Quantity Sold', align: 'center', field: 'totalQty' },
  {
    name: 'totalSales',
    label: 'Total Sales (₱)',
    align: 'right',
    field: (row) => row.totalSales.toFixed(2),
  },
]

const clearFilter = () => {
  selectedDate.value = null
  loadReport()
}

const loadReport = () => {
  store.getDailyItemsSoldReport(selectedDate.value)
  filterOpen.value = false
}

const printItemsSoldReport = () => {
  const width = 800
  const height = 1100
  const left = window.screenX + (window.outerWidth - width) / 2
  const top = window.screenY + (window.outerHeight - height) / 2

  const printWindow = window.open(
    '',
    '',
    `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`,
  )
  const formattedDate = selectedDate.value || 'All Dates'

  const styles = `
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      h2 { text-align: center; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
      th { background-color: #f4f4f4; }
      tfoot td { font-weight: bold; }
    </style>
  `

  let tableRows = ''
  reportData.value.forEach((item) => {
    tableRows += `
      <tr>
        <td>${formattedDate}</td>
        <td>${item.itemName}</td>
        <td>${item.price.toFixed(2)}</td>
        <td style="text-align:center;">${item.totalQty}</td>
        <td style="text-align:right;">₱${item.totalSales.toFixed(2)}</td>
      </tr>
    `
  })

  const printContent = `
    <html>
      <head>
        <title>Daily Items Sold Report</title>
        ${styles}
      </head>
      <body>
        <h2>Daily Items Sold Report</h2>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Item</th>
               <th>Price</th>
              <th>Quantity Sold</th>
              <th>Total Sales (₱)</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
          <tfoot>
            <tr>
             <td colspan="3"><strong>Total</strong></td>
              <td style="text-align:center;">${totalQty.value}</td>
              <td style="text-align:right;">₱${totalSales.value.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </body>
    </html>
  `

  printWindow.document.write(printContent)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}

onMounted(() => {
  loadReport()
})
</script>
