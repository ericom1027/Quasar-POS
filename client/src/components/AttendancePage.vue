<template>
  <q-page padding>
    <q-card class="q-mt-lg">
      <q-card-section class="row items-center justify-between">
        <div class="text-h6">Employee Attendance</div>
      </q-card-section>

      <q-card-section>
        <div class="row q-col-gutter-md items-end">
          <q-expansion-item label="Select Date" icon="filter_list" class="q-my-md">
            <div class="q-pb-sm">
              <q-date
                v-model="filterRange"
                range
                emit-immediately
                color="primary"
                mask="YYYY-MM-DD"
                class="col-12 col-sm-4"
              />

              <div class="q-mt-sm flex justify-end">
                <q-btn label="Clear Filter" color="negative" flat dense @click="clearFilter" />
              </div>
            </div>
            <div v-if="filterRange.from && filterRange.to" class="q-mt-sm text-caption">
              Showing results from <strong>{{ filterRange.from }}</strong> to
              <strong>{{ filterRange.to }}</strong>
            </div>
          </q-expansion-item>
        </div>
      </q-card-section>
      <q-separator />

      <q-card-section>
        <q-card-section class="q-pa-sm row justify-end">
          <q-btn
            icon="refresh"
            label="Refresh"
            color="secondary"
            @click="fetchAll"
            :loading="loading"
          />
          <q-btn
            icon="print"
            class="q-ml-sm"
            label="Print"
            color="primary"
            @click="printAttendance"
          />
        </q-card-section>

        <q-table
          :rows="filteredAttendance"
          :columns="columns"
          row-key="_id"
          flat
          bordered
          :loading="loading"
          no-data-label="No attendance records found."
        >
          <template v-slot:body-cell-name="props">
            <q-td> {{ props.row.user.firstname }} {{ props.row.user.lastname }} </q-td>
          </template>

          <template v-slot:body-cell-timeIn="props">
            <q-td>{{ formatTime(props.row.timeIn) }}</q-td>
          </template>

          <template v-slot:body-cell-timeOut="props">
            <q-td>
              <span v-if="props.row.timeOut">
                {{ formatTime(props.row.timeOut) }}
              </span>
              <span v-else class="text-grey">Not logged out yet</span>
            </q-td>
          </template>

          <template v-slot:body-cell-totalHours="props">
            <q-td>
              {{ formatHours(props.row.totalHours) }}
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td align="center">
              <q-btn
                dense
                flat
                color="primary"
                icon="visibility"
                @click="viewAttendance(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useAttendanceStore } from '../stores/attendanceStore'
import { useQuasar } from 'quasar'
import { storeToRefs } from 'pinia'
import moment from 'moment'

const $q = useQuasar()
const attendanceStore = useAttendanceStore()
const { allAttendance, loading } = storeToRefs(attendanceStore)
const { fetchAllAttendance } = attendanceStore

const filterRange = ref({ from: '', to: '' })

const filter = computed(() => ({
  from: filterRange.value?.from || '',
  to: filterRange.value?.to || '',
}))

const filteredAttendance = computed(() => {
  if (!filter.value.from && !filter.value.to) {
    return allAttendance.value
  }

  return allAttendance.value.filter((record) => {
    const recordDate = new Date(record.date).toISOString().split('T')[0]
    return (
      (!filter.value.from || recordDate >= filter.value.from) &&
      (!filter.value.to || recordDate <= filter.value.to)
    )
  })
})

const clearFilter = () => {
  filterRange.value = { from: '', to: '' }
}

const fetchAll = () => {
  fetchAllAttendance()
}

onMounted(() => {
  fetchAll()
})

const formatTime = (time) => {
  return time ? new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const year = date.getFullYear()
  return `${month}/${day}/${year}`
}

const formatHours = (hours) => {
  if (!hours) return '0h 0m'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}h ${m}m`
}

const viewAttendance = (row) => {
  $q.dialog({
    title: '🕒  Attendance Details',
    html: true,
    message: `
      <div style="font-family: 'Segoe UI', sans-serif; font-size: 15px; padding: 10px; border: 1px solid #ccc; border-radius: 8px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px; font-weight: 600; width: 40%;">Name:</td>
            <td style="padding: 6px;">${row.user.firstname} ${row.user.lastname}</td>
          </tr>
          <tr>
            <td style="padding: 6px; font-weight: 600;">Date:</td>
            <td style="padding: 6px;">${formatDate(row.date)}</td>
          </tr>
          <tr>
            <td style="padding: 6px; font-weight: 600;">Time In:</td>
            <td style="padding: 6px;">${formatTime(row.timeIn)}</td>
          </tr>
          <tr>
            <td style="padding: 6px; font-weight: 600;">Time Out:</td>
            <td style="padding: 6px;">${row.timeOut ? formatTime(row.timeOut) : 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 6px; font-weight: 600;">Total Hours:</td>
            <td style="padding: 6px;">${formatHours(row.totalHours)}</td>
          </tr>
        </table>
      </div>
    `,
    ok: {
      label: 'Close',
      flat: true,
      color: 'primary',
    },
  })
}

const printAttendance = () => {
  const originalContent = document.body.innerHTML
  let htmlContent = `
    <html>
    <head>
      <title>Attendance Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        h2 { text-align: center; }
      </style>
    </head>
    <body>
      <h6>Employee Attendance Report</h6>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Date</th>
            <th>Time In</th>
            <th>Time Out</th>
            <th>Total Hours</th>
          </tr>
        </thead>
        <tbody>
  `

  filteredAttendance.value.forEach((row) => {
    htmlContent += `
      <tr>
        <td>${row.user.firstname} ${row.user.lastname}</td>
        <td>${formatDate(row.date)}</td>
        <td>${formatTime(row.timeIn)}</td>
        <td>${row.timeOut ? formatTime(row.timeOut) : 'Not logged out yet'}</td>
        <td>${formatHours(row.totalHours)}</td>
      </tr>
    `
  })

  htmlContent += `
      </tbody>
    </table>
  `

  document.body.innerHTML = htmlContent
  window.print()
  document.body.innerHTML = originalContent
  window.location.reload()
}

const columns = [
  {
    name: 'name',
    label: 'Name',
    field: (row) => `${row.user.firstname} ${row.user.lastname}`,
    sortable: true,
    align: 'left',
  },
  {
    name: 'date',
    label: 'Date',
    field: (row) => moment(row.date).format('MM/DD/YYYY'),
    sortable: true,
    align: 'center',
  },
  { name: 'timeIn', label: 'Time In', field: 'timeIn', sortable: true, align: 'left' },
  { name: 'timeOut', label: 'Time Out', field: 'timeOut', sortable: true, align: 'left' },
  {
    name: 'totalHours',
    label: 'Total Hours',
    field: 'totalHours',
    sortable: true,
    align: 'left',
  },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' },
]
</script>
