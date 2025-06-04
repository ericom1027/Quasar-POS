<template>
  <q-card>
    <q-card-section>
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        "
      >
        <div class="text-h6">
          Shift History
          <div><q-btn icon="print" label="Print" @click="printTable" color="primary" /></div>
        </div>
        <q-input
          outlined
          dense
          v-model="search"
          label="Search by Cashier"
          class="q-mb-md"
          debounce="300"
          clearable
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <q-table
        :rows="filteredShifts"
        :columns="columns"
        row-key="_id"
        :loading="shiftStore.loading"
      />

      <q-banner v-if="shiftStore.error" class="bg-red text-white q-mt-md">
        {{ shiftStore.error }}
      </q-banner>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useShiftStore } from 'stores/shiftStore'

const shiftStore = useShiftStore()
const search = ref('')

onMounted(() => {
  shiftStore.fetchShifts()
})

const formatMoney = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '0.00'
  return Number(value).toFixed(2)
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString()
}

const filteredShifts = computed(() => {
  if (!search.value) return shiftStore.shifts
  return shiftStore.shifts.filter((shift) =>
    shift.cashierName?.toLowerCase().includes(search.value.toLowerCase()),
  )
})

const printTable = () => {
  const originalContent = document.body.innerHTML

  let htmlContent = `
    <html>
      <head>
        <title>Shift History Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          h2 { text-align: center; }
        </style>
      </head>
      <body>
        <h6>Shift History Report</h6>
        <table>
          <thead>
            <tr>
              <th>Cashier</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Starting Cash</th>
              <th>Ending Cash</th>
              <th>Expected Cash</th>
              <th>Difference</th>
            </tr>
          </thead>
          <tbody>
  `

  filteredShifts.value.forEach((row) => {
    htmlContent += `
      <tr>
        <td>${row.cashierName}</td>
        <td>${formatDate(row.startTime)}</td>
        <td>${row.endTime ? formatDate(row.endTime) : 'Open'}</td>
        <td>₱ ${formatMoney(row.startingCash)}</td>
        <td>₱ ${formatMoney(row.endingCash)}</td>
        <td>₱ ${formatMoney(row.expectedCash)}</td>
        <td>₱ ${formatMoney(row.cashDifference)}</td>
      </tr>
    `
  })

  htmlContent += `
          </tbody>
        </table>
      </body>
    </html>
  `

  document.body.innerHTML = htmlContent
  window.print()
  document.body.innerHTML = originalContent
  window.location.reload()
}

const columns = [
  {
    name: 'cashierName',
    label: 'Cashier',
    field: 'cashierName',
  },
  {
    name: 'startTime',
    label: 'Start Time',
    field: (row) => new Date(row.startTime).toLocaleString(),
  },
  {
    name: 'endTime',
    label: 'End Time',
    field: (row) => (row.endTime ? new Date(row.endTime).toLocaleString() : 'Open'),
  },
  {
    name: 'startingCash',
    label: 'Starting Cash',
    field: 'startingCash',
    format: (val) => `₱ ${Number(val).toFixed(2)}`,
  },
  {
    name: 'endingCash',
    label: 'Ending Cash',
    field: 'endingCash',
    format: (val) => `₱ ${Number(val).toFixed(2)}`,
  },
  {
    name: 'expectedCash',
    label: 'Expected Cash',
    field: 'expectedCash',
    format: (val) => `₱ ${Number(val).toFixed(2)}`,
  },
  {
    name: 'cashDifference',
    label: 'Difference',
    field: 'cashDifference',
    format: (val) => `₱ ${Number(val).toFixed(2)}`,
  },
]
</script>
