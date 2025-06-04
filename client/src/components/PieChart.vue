<template>
  <div style="position: relative; width: 100%; height: 300px">
    <Pie :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

defineProps(['chartData', 'chartOptions'])
</script>
