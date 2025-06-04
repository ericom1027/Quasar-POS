<template>
  <q-page padding>
    <div class="q-gutter-md">
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6">Monthly Sales Report</div>
        </q-card-section>

        <q-card-section v-if="loading">
          <q-spinner size="30px" color="primary" />
          <span class="q-ml-sm">Loading...</span>
        </q-card-section>

        <q-card-section v-else-if="error">
          <q-banner class="bg-red-2 text-red-10"> {{ error }} </q-banner>
        </q-card-section>

        <q-card-section v-else>
          <div class="text-subtitle1">
            Month: <strong>{{ sales?.month }}</strong>
          </div>
          <div class="q-mb-md">
            <q-badge color="green" label="Total Sales" />
            <div class="text-h6">₱{{ sales?.totalSales.toLocaleString() }}</div>
          </div>
          <div class="q-mb-md">
            <q-badge color="blue" label="Total Transactions" />
            <div class="text-h6">{{ sales?.totalTransactions }}</div>
          </div>
        </q-card-section>

        <q-card-section class="row q-col-gutter-md items-center">
          <div class="col-12 col-sm-4">
            <q-select
              filled
              v-model="selectedMonth"
              :options="monthOptions"
              option-label="label"
              option-value="value"
              label="Select Month"
              emit-value
              map-options
            />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-card-section class="q-pt-none row justify-end">
            <q-btn icon="print" label="Print" color="primary" @click="onPrint" />
          </q-card-section>

          <q-table
            flat
            bordered
            dense
            :rows="sales?.bills || []"
            :columns="columns"
            row-key="_id"
            :pagination="{ rowsPerPage: 10 }"
          >
            <template v-slot:body-cell-createdAt="props">
              <q-td :props="props">
                {{ formatDate(props.row.createdAt) }}
              </q-td>
            </template>

            <template v-slot:body-cell-totalAmount="props">
              <q-td :props="props"> ₱{{ props.row.totalAmount.toLocaleString() }} </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, computed, ref, watch } from 'vue'
import { useBillStore } from '../stores/billStore'
import { date } from 'quasar'

const store = useBillStore()

const selectedMonth = ref('')
const monthOptions = [
  { label: 'January', value: '01' },
  { label: 'February', value: '02' },
  { label: 'March', value: '03' },
  { label: 'April', value: '04' },
  { label: 'May', value: '05' },
  { label: 'June', value: '06' },
  { label: 'July', value: '07' },
  { label: 'August', value: '08' },
  { label: 'September', value: '09' },
  { label: 'October', value: '10' },
  { label: 'November', value: '11' },
  { label: 'December', value: '12' },
]

watch(selectedMonth, (val) => {
  if (val) {
    store.getMonthlySales(val)
  }
})

onMounted(() => {
  const currentMonth = new Date().toISOString().slice(5, 7)
  selectedMonth.value = currentMonth
  store.getMonthlySales(selectedMonth.value)
})

const sales = computed(() => store.monthlySales)
const loading = computed(() => store.loading)
const error = computed(() => store.error)

function formatDate(dt) {
  return date.formatDate(dt, 'MMMM D, YYYY h:mm A')
}

function onPrint() {
  if (sales.value) {
    printMonthlySales(
      {
        ...sales.value,
        bills: sales.value.bills || [],
        totalSales: sales.value.totalSales,
        totalTransactions: sales.value.bills?.length || 0,
      },
      columns,
    )
  } else {
    alert('No sales data to print!')
  }
}

function printMonthlySales(salesData, columns) {
  const width = 800
  const height = 1100
  const left = window.screenX + (window.outerWidth - width) / 2
  const top = window.screenY + (window.outerHeight - height) / 2

  const printWindow = window.open(
    '',
    'Print Monthly Sales',
    `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`,
  )

  const styles = `
    <style>
      @media print {
        @page {
          size: A4 portrait;
          margin: 20mm;
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 12pt;
          margin: 0;
          padding: 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          page-break-inside: auto;
        }
        tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }
        th, td {
          border: 1px solid #333;
          padding: 6px 8px;
          text-align: left;
        }
        th {
          background: #f0f0f0;
        }
        .center {
          text-align: center;
        }
        .header, .footer {
          text-align: center;
          margin: 20px 0;
        }
        .total-sales {
          margin-top: 20px;
          font-weight: bold;
          font-size: 1.2em;
        }
      }
    </style>
  `

  const headerHtml = `
    <div class="header">
      <h2>Monthly Sales Report</h2>
      <div>Month: ${salesData.month}</div>
    </div>
  `

  const tableHeader = columns.map((col) => `<th>${col.label}</th>`).join('')

  const tableRows = salesData.bills
    .map((row) => {
      const cells = columns
        .map((col) => {
          let value
          if (typeof col.field === 'function') {
            value = col.field(row)
          } else if (col.format) {
            value = col.format(row[col.field])
          } else {
            value = row[col.field]
          }

          // Format specific fields if needed
          if (col.name === 'totalAmount') {
            value = `₱${parseFloat(value).toLocaleString()}`
          }
          if (col.name === 'createdAt') {
            value = formatDate(value)
          }

          return `<td>${value}</td>`
        })
        .join('')
      return `<tr>${cells}</tr>`
    })
    .join('')

  const tableHtml = `
    <table>
      <thead><tr>${tableHeader}</tr></thead>
      <tbody>${tableRows}</tbody>
    </table>
  `

  const totalSalesHtml = `
    <div class="total-sales">
      Total Sales: ₱${salesData.totalSales.toFixed(2)}<br/>
      Total Transactions: ${salesData.totalTransactions}
    </div>
  `

  printWindow.document.write(`
    <html>
      <head>
        <title>Monthly Sales - ${salesData.month}</title>
        ${styles}
      </head>
      <body>
        ${headerHtml}
        ${tableHtml}
        ${totalSalesHtml}
      </body>
    </html>
  `)

  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}

const columns = [
  { name: 'createdAt', label: 'Date', align: 'left', field: 'createdAt', sortable: true },
  { name: 'invoiceNumber', label: 'Receipt No.', align: 'left', field: 'invoiceNumber' },
  {
    name: 'cartItems',
    label: 'Item Name',
    field: (row) => row.cartItems.map((item) => `${item.itemName} (qty${item.qty})`).join(', '),
    align: 'left',
  },
  { name: 'totalAmount', label: 'Amount', align: 'right', field: 'totalAmount', sortable: true },
]
</script>
