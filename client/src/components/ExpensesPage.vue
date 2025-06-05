<template>
  <q-page padding>
    <q-btn color="primary" label="Add Expenses" @click="openAddDialog" class="q-mb-md" />
    <q-btn
      color="secondary"
      label="Print"
      icon="print"
      class="q-mb-md q-ml-sm"
      @click="printReport"
    />

    <q-table
      title-class="text-h6"
      title="Expenses List"
      :rows="expenses"
      :columns="columns"
      row-key="_id"
      :loading="loading"
      flat
      bordered
      separator="horizontal"
    >
      <template v-slot:body-cell-actions="props">
        <q-td>
          <q-btn dense flat icon="edit" color="primary" @click="openEditDialog(props.row)" />
          <q-btn dense flat icon="delete" color="negative" @click="confirmDelete(props.row)" />
        </q-td>
      </template>
    </q-table>

    <!-- Add/Edit Dialog -->
    <q-dialog v-model="dialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ isEdit ? 'Edit Expenses' : 'Add Expenses' }}</div>
        </q-card-section>

        <q-card-section>
          <q-input filled v-model="form.description" label="Description" required />
          <q-input
            filled
            v-model.number="form.amount"
            label="Amount"
            type="number"
            required
            class="q-mt-sm"
          />
          <q-select
            filled
            v-model="form.category"
            label="Category"
            :options="categoryOptions"
            emit-value
            map-options
            class="q-mt-sm"
          />

          <q-select
            filled
            v-model="form.paymentMethod"
            label="Payment Method"
            :options="paymentMethodOptions"
            emit-value
            map-options
            class="q-mt-sm"
          />
          <q-input filled v-model="form.date" label="Date" type="date" class="q-mt-sm" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            flat
            label="Save"
            color="primary"
            @click="saveExpense"
            :disable="!form.description || !form.amount"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useExpensesStore } from '../stores/expensesStore'
import { Notify, Dialog } from 'quasar'

const store = useExpensesStore()

const expenses = computed(() => store.expenses)
const loading = computed(() => store.loading)

const dialog = ref(false)
const isEdit = ref(false)
const editingId = ref(null)

const categoryOptions = [
  { label: 'Supplies', value: 'Supplies' },
  { label: 'Utilities', value: 'Utilities' },
  { label: 'Maintenance', value: 'Maintenance' },
  { label: 'Salary', value: 'Salary' },
  { label: 'Other', value: 'Other' },
]

const paymentMethodOptions = [
  { label: 'Cash', value: 'Cash' },
  { label: 'Gcash', value: 'Gcash' },
  { label: 'Bank', value: 'Bank' },
  { label: 'Other', value: 'Other' },
]

const form = ref({
  description: '',
  amount: null,
  category: '',
  paymentMethod: '',
  date: '',
})

const columns = [
  {
    name: 'description',
    label: 'Description',
    field: 'description',
    sortable: true,
    align: 'left',
  },
  {
    name: 'amount',
    label: 'Amount',
    field: (row) => row.amount?.toFixed(2),
    sortable: true,
    align: 'left',
  },
  { name: 'category', label: 'Category', field: 'category', sortable: true, align: 'left' },
  {
    name: 'paymentMethod',
    label: 'Payment Method',
    field: 'paymentMethod',
    sortable: true,
    align: 'left',
  },
  {
    name: 'createdAt',
    label: 'Date',
    field: (row) => new Date(row.createdAt).toLocaleDateString(),
    sortable: true,
    align: 'left',
  },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'left', sortable: false },
]

onMounted(() => {
  store.fetchExpenses()
})

function printReport() {
  const expensesRows = expenses.value || []

  let rowsHtml = ''
  expensesRows.forEach((row) => {
    rowsHtml += `
      <tr>
          <td>${row.createdAt ? new Date(row.createdAt).toLocaleDateString() : ''}</td>
        <td>${row.description || ''}</td>
        <td>₱${Number(row.amount || 0).toFixed(2)}</td>
        <td>${row.category || ''}</td>
        <td>${row.paymentMethod || ''}</td>
     


      </tr>
    `
  })

  const html = `
    <html>
      <head>
        <title>Expenses Report</title>
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
        <h1>Expenses Report</h1>
        <h3>${new Date().toLocaleDateString()}</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Payment Method</th>
              
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

function openAddDialog() {
  isEdit.value = false
  form.value = {
    description: '',
    amount: null,
    category: '',
    paymentMethod: '',
    date: '',
  }
  dialog.value = true
}

function openEditDialog(expense) {
  isEdit.value = true
  form.value = {
    description: expense.description,
    amount: expense.amount,
    category: expense.category || '',
    paymentMethod: expense.paymentMethod || '',
    date: expense.createdAt ? new Date(expense.createdAt).toISOString().substr(0, 10) : '',
  }
  editingId.value = expense._id
  dialog.value = true
}

async function saveExpense() {
  try {
    if (isEdit.value) {
      await store.editExpense(editingId.value, form.value)
      Notify.create({
        message: 'Expense updated successfully',
        color: 'positive',
        position: 'bottom-right',
      })
    } else {
      await store.addExpense(form.value)
      Notify.create({
        message: 'Expense added successfully',
        color: 'positive',
        position: 'bottom-right',
      })
    }
    await store.fetchExpenses()
    dialog.value = false
  } catch (err) {
    Notify.create({
      message: err.response?.data?.error || err.message,
      color: 'negative',
      position: 'bottom-right',
    })
  }
}

function confirmDelete(expense) {
  Dialog.create({
    title: 'Confirm Delete',
    message: `Delete expense "${expense.description}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await store.deleteExpense(expense._id)
      await store.fetchExpenses()
      Notify.create({
        message: 'Expense deleted successfully',
        color: 'positive',
        position: 'bottom-right',
      })
    } catch (err) {
      Notify.create({
        message: err.response?.data?.error || err.message,
        color: 'negative',
        position: 'bottom-right',
      })
    }
  })
}
</script>
