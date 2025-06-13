<template>
  <q-page class="column q-pa-md" style="margin-top: 20px">
    <div v-if="isLoading" class="full-width flex flex-center" style="height: 100vh">
      <q-spinner color="primary" size="40px" />
    </div>

    <div class="row q-col-gutter-md justify-center" v-else>
      <!-- Daily Sales -->
      <div class="col-xs-12 col-sm-6 col-md-4 col-lg-3">
        <q-card class="bg-indigo text-white" style="border-radius: 12px" flat>
          <q-card-section class="text-center q-pa-sm">
            <q-icon name="monetization_on" size="24px" color="white" class="q-mb-xs" />
            <div class="text-subtitle2">Total Daily Sales</div>
            <div class="text-caption q-mb-xs">{{ formattedDate }}</div>
          </q-card-section>
          <q-separator color="white" inset />
          <q-card-section class="text-center q-pa-sm">
            <div class="text-h6 text-weight-bold">
              ₱ {{ billStore.dailySales?.totalSales?.toFixed(2) || '0.00' }}
            </div>
            <div class="text-caption">
              Transactions: {{ billStore.dailySales?.totalTransactions || 0 }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Weekly Sales -->
      <div class="col-xs-12 col-sm-6 col-md-4 col-lg-3">
        <q-card class="bg-green text-white" style="border-radius: 12px" flat>
          <q-card-section class="text-center q-pa-sm">
            <q-icon name="calendar_today" size="24px" color="white" class="q-mb-xs" />
            <div class="text-subtitle2">Total Weekly Sales</div>
            <div class="text-caption q-mb-xs">
              {{ billStore.weeklySales?.weekStart }} - {{ billStore.weeklySales?.weekEnd }}
            </div>
          </q-card-section>
          <q-separator color="white" inset />
          <q-card-section class="text-center q-pa-sm">
            <div class="text-h6 text-weight-bold">
              ₱ {{ billStore.weeklySales?.totalSales?.toFixed(2) || '0.00' }}
            </div>
            <div class="text-caption">
              Transactions: {{ billStore.weeklySales?.totalTransactions || 0 }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Monthly Sales -->

      <div class="col-xs-12 col-sm-6 col-md-4 col-lg-3">
        <q-card class="bg-deep-orange text-white" style="border-radius: 12px" flat>
          <q-card-section class="text-center q-pa-sm">
            <q-icon name="calendar_view_month" size="24px" color="white" class="q-mb-xs" />
            <div class="text-subtitle2">Total Monthly Sales</div>
            <div class="text-caption q-mb-xs">
              {{ billStore.monthlySales?.month || 'Loading...' }}
            </div>
          </q-card-section>
          <q-separator color="white" inset />
          <q-card-section class="text-center q-pa-sm">
            <div class="text-h6 text-weight-bold">
              ₱ {{ billStore.monthlySales?.totalSales?.toFixed(2) || '0.00' }}
            </div>
            <div class="text-caption">
              Transactions: {{ billStore.monthlySales?.totalTransactions || 0 }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Charts Section -->

    <div class="q-mt-lg row q-col-gutter-md">
      <!-- Daily Sales Chart -->
      <div class="col-12 col-md-4">
        <q-card flat bordered class="q-pa-md" style="min-height: 300px; height: 100%">
          <div class="text-subtitle1 q-mb-sm">Daily Sales (This Month)</div>
          <div class="column" style="flex: 1">
            <line-chart :chart-data="dailyChartData" :chart-options="chartOptions" />
          </div>
        </q-card>
      </div>

      <!-- Monthly Sales Chart -->
      <div class="col-12 col-md-4">
        <q-card flat bordered class="q-pa-md" style="min-height: 300px; height: 100%">
          <div class="text-subtitle1 q-mb-sm">Monthly Sales (This Year)</div>
          <div class="column" style="flex: 1">
            <pie-chart :chart-data="monthlyChartData" :chart-options="chartOptions" />
          </div>
        </q-card>
      </div>

      <!-- Daily Sold Items Gauge -->
      <div class="col-12 col-md-4">
        <q-card
          flat
          bordered
          class="flex flex-center q-pa-md"
          style="min-height: 300px; border-radius: 12px"
        >
          <div class="column items-center">
            <div class="text-subtitle1 q-mb-sm">Items Sold Today</div>
            <q-knob
              :model-value="soldToday"
              :min="0"
              :max="dailyTarget"
              size="150px"
              color="deep-purple"
              track-color="grey-6"
              show-value
              :thickness="0.25"
              class="q-mb-sm"
              :format-value="(val) => `${val}%`"
            >
              <div class="text-subtitle2 text-center" style="font-size: 22px">{{ soldToday }}%</div>
            </q-knob>
          </div>
        </q-card>
      </div>
    </div>

    <span class="text-h6 text-center q-mt-md q-px-md q-pa-sm text-grey" ref="typedText"></span>
  </q-page>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
import { useBillStore } from '../stores/billStore'
import { date } from 'quasar'
import LineChart from '../components/LineChart.vue'
import PieChart from '../components/PieChart.vue'
import Typed from 'typed.js'

const billStore = useBillStore()
const typedText = ref(null)

const dailyTarget = 100

const soldToday = computed(() => {
  const qty = Number(billStore.dailyItemsSoldReport?.overallTotalQty) || 0
  const percent = (qty / dailyTarget) * 100
  return Math.min(Number(percent.toFixed(0)), 100)
})

onMounted(() => {
  const today = new Date().toISOString().split('T')[0]
  billStore.getDailySales()
  billStore.getWeeklySales()
  billStore.getMonthlySales()
  billStore.getDailySalesGraph()
  billStore.getMonthlySalesGraph()
  billStore.getDailyItemsSoldReport(today)

  new Typed(typedText.value, {
    strings: [
      'Smart. Fast. Cloud POS.',
      'Powered by EMD Dev!',
      'Cloud POS You Can Trust.',
      'Sell Smarter with Cloud POS!',
      'Cloud POS, Big Results.',
      'Your Business, On the Cloud.',
    ],

    typeSpeed: 100,
    loop: true,
    backSpeed: 50,
    backDelay: 2000,
  })
})

const formattedDate = computed(() =>
  billStore.dailySales?.date
    ? date.formatDate(billStore.dailySales.date, 'MMMM DD, YYYY')
    : 'Today',
)

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        font: {
          size: window.innerWidth < 600 ? 10 : 14,
        },
      },
    },
  },
}

const dailyChartData = computed(() => {
  const sales = billStore.dailySalesGraph || []
  return {
    labels: sales.map((item) => date.formatDate(new Date(item.date), 'MMM D')),

    datasets: [
      {
        label: 'Daily Sales',
        data: sales.map((item) => item.totalSales),
        fill: false,
        borderColor: '#3f51b5',
        tension: 0.1,
      },
    ],
  }
})

const monthlyChartData = computed(() => {
  const sales = billStore.monthlySalesGraph || []
  const colors = [
    '#36A2EB',
    '#FFCE56',
    '#4CAF50',
    '#FF9F40',
    '#9966FF',
    '#00BCD4',
    '#8BC34A',
    '#9C27B0',
    '#03A9F4',
    '#CDDC39',
  ]

  return {
    labels: sales.map((item) => date.formatDate(item.month, 'MMM YYYY')),
    datasets: [
      {
        label: 'Monthly Sales',
        data: sales.map((item) => item.totalSales),
        backgroundColor: sales.map((_, i) => colors[i % colors.length]),
      },
    ],
  }
})
</script>
