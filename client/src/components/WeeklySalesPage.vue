<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="text-h6">Weekly Sales Report</div>

        <div v-if="salesStore.loading" class="q-mt-md">
          <q-spinner color="primary" size="md" />
          <span class="q-ml-sm">Loading...</span>
        </div>

        <div v-else-if="salesStore.error" class="text-negative q-mt-md">
          {{ salesStore.error }}
        </div>

        <div v-else-if="salesStore.weeklySales" class="q-mt-md">
          <div class="text-subtitle2">
            Week: {{ salesStore.weeklySales.weekStart }} to {{ salesStore.weeklySales.weekEnd }}
          </div>
          <div class="q-mt-sm">
            <q-badge color="green" label="Total Sales" /> ₱{{
              salesStore.weeklySales.totalSales.toFixed(2)
            }}
          </div>
          <div>
            <q-badge color="blue" label="Total Transactions" />
            {{ salesStore.weeklySales.totalTransactions }}
          </div>

          <q-card-section>
            <div class="row q-col-gutter-md items-end">
              <q-expansion-item label="Filter by Date" icon="event" class="q-my-md">
                <div class="q-pb-sm">
                  <q-date v-model="dateRange" range class="q-mb-md" />
                  <div class="q-mt-sm flex justify-end">
                    <q-btn label="Clear Filter" color="negative" flat @click="clearFilter" />
                  </div>
                </div>
                <div v-if="dateRange.from && dateRange.to" class="q-mt-sm text-caption">
                  Showing results from <strong>{{ dateRange.from }}</strong> to
                  <strong>{{ dateRange.to }}</strong>
                </div>
              </q-expansion-item>
            </div>
          </q-card-section>

          <q-separator class="q-my-md" />
          <q-card-section class="q-pt-none row justify-end">
            <q-btn icon="print" label="Print" color="primary" @click="onPrint" />
          </q-card-section>

          <q-table :rows="filteredRows" :columns="columns" row-key="_id" flat bordered dense />
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useBillStore } from '../stores/billStore'

const salesStore = useBillStore()

const dateRange = ref({ from: '', to: '' })

const clearFilter = () => {
  dateRange.value = { from: '', to: '' }
}

const formatDate = (str) => str?.replaceAll('/', '-')

const filteredRows = computed(() => {
  if (!salesStore.weeklySales || !salesStore.weeklySales.bills) return []

  const from = dateRange.value.from ? new Date(formatDate(dateRange.value.from)) : null
  const to = dateRange.value.to ? new Date(formatDate(dateRange.value.to)) : null

  return salesStore.weeklySales.bills.filter((row) => {
    const rowDate = new Date(row.createdAt)

    const rowOnlyDate = new Date(rowDate.toDateString())
    const fromOnlyDate = from ? new Date(from.toDateString()) : null
    const toOnlyDate = to ? new Date(to.toDateString()) : null

    if (fromOnlyDate && toOnlyDate) {
      return rowOnlyDate >= fromOnlyDate && rowOnlyDate <= toOnlyDate
    }

    return true
  })
})

const columns = [
  {
    name: 'createdAt',
    label: 'Date',
    field: (row) => new Date(row.createdAt).toLocaleString(),
    sortable: true,
    align: 'center',
  },
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
    label: 'Amount',
    field: 'totalAmount',
    sortable: true,
    format: (val) => `₱ ${Number(val).toFixed(2)}`,
  },
  {
    name: 'seniorOrPWD',
    label: 'Senior/PWD',
    field: (row) => (row.seniorOrPWD ? 'Yes' : 'No'),
    align: 'center',
  },
]

function onPrint() {
  if (salesStore.weeklySales) {
    printWeeklySales(salesStore.weeklySales, columns)
  } else {
    alert('No sales data to print!')
  }
}

function printWeeklySales(salesData, columns) {
  const width = 800
  const height = 1100
  const left = window.screenX + (window.outerWidth - width) / 2
  const top = window.screenY + (window.outerHeight - height) / 2

  const printWindow = window.open(
    '',
    'Print Weekly Sales',
    `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`,
  )

  const styles = `
    <style>
      @media print {
        @page { size: A4; margin: 20mm; }
        body { font-family: Arial, sans-serif; font-size: 12pt; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #333; padding: 6px 8px; text-align: left; }
        th { background: #f0f0f0; }
        .header, .footer { text-align: center; margin: 20px 0; }
        .total-sales { margin-top: 20px; font-weight: bold; font-size: 1.2em; }
      }
    </style>
  `

  const headerHtml = `
    <div class="header">
      <h2>Weekly Sales Summary</h2>
      <div>Week: ${salesData.weekStart} to ${salesData.weekEnd}</div>
    </div>
  `

  const tableHeader = columns.map((col) => `<th>${col.label}</th>`).join('')

  const tableRows = salesData.bills
    .map((row) => {
      const cells = columns
        .map((col) => {
          let value = typeof col.field === 'function' ? col.field(row) : row[col.field]
          if (col.format) value = col.format(value)
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
      <head><title>Weekly Sales - ${salesData.weekStart} to ${salesData.weekEnd}</title>${styles}</head>
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

onMounted(() => {
  salesStore.getWeeklySales()
})
</script>
