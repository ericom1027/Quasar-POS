<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section v-if="salesStore.dailySales?.bills?.length">
        <DailySalesChart :chart-data="chartData" :chart-options="chartOptions" />
      </q-card-section>

      <q-card-section>
        <div class="text-h6">Daily Sales Summary</div>
        <div class="text-subtitle2">Date: {{ salesStore.dailySales?.date }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section v-if="salesStore.loading">
        <q-spinner color="primary" size="2em" />
      </q-card-section>

      <q-card-section v-else-if="salesStore.error">
        <q-banner type="negative">
          {{ salesStore.error }}
        </q-banner>
      </q-card-section>

      <q-card-section v-else-if="salesStore.dailySales">
        <div class="q-mb-md">
          <q-badge color="green" label="Total Sales" />
          <div class="text-h6">₱ {{ filteredTotalSales.toFixed(2) }}</div>
        </div>
        <div class="q-mb-md">
          <q-badge color="blue" label="Total Transactions" />
          <div class="text-h6">{{ filteredBills.length }}</div>
        </div>

        <div class="row q-col-gutter-md items-end">
          <q-expansion-item label="Filter by Date" icon="event" class="q-my-md">
            <div class="q-pb-sm">
              <q-date v-model="date" landscape @update:model-value="fetchSalesByDate" />
              <div class="q-mt-sm flex justify-end">
                <q-btn label="Clear Filter" color="negative" flat @click="clearFilter" />
              </div>
            </div>
          </q-expansion-item>
        </div>

        <q-card-section class="q-pt-none row justify-end">
          <q-btn icon="print" label="Print" color="primary" @click="onPrint" />
        </q-card-section>

        <q-table
          title="Today's Bills"
          :rows="filteredBills"
          :columns="columns"
          row-key="_id"
          flat
          bordered
          dense
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

import { useBillStore } from '../stores/billStore'
import DailySalesChart from '../components/LineChart.vue'

const salesStore = useBillStore()
const date = ref(null)

const clearFilter = () => {
  date.value = null
  salesStore.getDailySales()
}

const columns = [
  { name: 'invoiceNumber', label: 'Receipt No.', field: 'invoiceNumber', align: 'left' },
  {
    name: 'cartItems',
    label: 'Item Name',
    field: (row) => row.cartItems.map((item) => `${item.itemName} (qty${item.qty})`).join(', '),
    align: 'left',
  },
  {
    name: 'cash',
    label: 'Cash Tendered',
    field: 'cash',
    align: 'left',
    format: (val) => `₱ ${Number(val).toFixed(2)}`,
  },
  {
    name: 'change',
    label: 'Change',
    field: 'change',
    align: 'left',
    format: (val) => `₱ ${Number(val).toFixed(2)}`,
  },
  {
    name: 'totalAmount',
    label: 'Amount (₱)',
    field: 'totalAmount',
    align: 'right',
    format: (val) => `₱ ${val.toFixed(2)}`,
  },
  {
    name: 'seniorOrPWD',
    label: 'Senior/PWD',
    field: (row) => (row.seniorOrPWD ? 'Yes' : 'No'),
    align: 'center',
  },
  {
    name: 'createdAt',
    label: 'Time',
    field: (row) => new Date(row.createdAt).toLocaleTimeString(),
    align: 'left',
  },
]

const filteredBills = computed(() => {
  if (!date.value) return salesStore.dailySales?.bills || []

  const selectedDate = new Date(date.value)
  return (salesStore.dailySales?.bills || []).filter((bill) => {
    const billDate = new Date(bill.createdAt)
    return (
      billDate.getFullYear() === selectedDate.getFullYear() &&
      billDate.getMonth() === selectedDate.getMonth() &&
      billDate.getDate() === selectedDate.getDate()
    )
  })
})

const filteredTotalSales = computed(() =>
  filteredBills.value.reduce((sum, bill) => sum + bill.totalAmount, 0),
)

const chartData = computed(() => {
  const bills = salesStore.dailySales?.bills || []
  return {
    labels: bills.map((b) => new Date(b.createdAt).toLocaleTimeString()),
    datasets: [
      {
        label: 'Sales Amount',
        data: bills.map((b) => b.totalAmount),
        borderColor: '#42A5F5',
        backgroundColor: 'rgba(66, 165, 245, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: true, position: 'top' },
    title: { display: true, text: 'Daily Sales Chart' },
  },
}

function onPrint() {
  if (salesStore.dailySales) {
    printDailySales(
      {
        ...salesStore.dailySales,
        bills: filteredBills.value,
        totalSales: filteredTotalSales.value,
        totalTransactions: filteredBills.value.length,
      },
      columns,
    )
  } else {
    alert('No sales data to print!')
  }
}

function printDailySales(salesData, columns) {
  const width = 800
  const height = 1100
  const left = window.screenX + (window.outerWidth - width) / 2
  const top = window.screenY + (window.outerHeight - height) / 2

  const printWindow = window.open(
    '',
    'Print Daily Sales',
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
          vertical-align: top;
          word-wrap: break-word;
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
      <h2>Daily Sales Summary</h2>
      <div>Print Date: ${salesData.date}</div>
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
        <title>Daily Sales - ${salesData.date}</title>
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

async function fetchSalesByDate() {
  await salesStore.getDailySales(date.value)
}

onMounted(() => {
  salesStore.getDailySales()
})
</script>
