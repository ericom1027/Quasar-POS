<template>
  <q-page class="q-pa-md">
    <div
      style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      "
    >
      <q-btn label="Add Item" @click="openAddDialog" color="primary" />

      <!-- Search Input -->
      <q-input
        v-model="search"
        label="Search by Item Name"
        outlined
        dense
        debounce="300"
        clearable
        style="max-width: 300px"
      >
        <template v-slot:append> <q-icon name="search" /> </template
      ></q-input>
    </div>

    <q-table
      :rows="filteredItems"
      :columns="columns"
      row-key="_id"
      flat
      bordered
      class="q-mt-md"
      :loading="itemsStore.loading"
    >
      <template v-slot:body-cell-actions="props">
        <q-td align="center">
          <q-btn icon="edit" flat dense @click="editItem(props.row)" />
          <q-btn icon="delete" flat dense color="negative" @click="deleteItem(props.row._id)" />
        </q-td>
      </template>
    </q-table>

    <!-- Add/Edit Dialog -->
    <q-dialog v-model="dialogVisible" persistent>
      <q-card class="q-pa-md" style="width: 100%; max-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ isEditing ? 'Edit Item' : 'Add Item' }}</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input v-model="form.itemName" label="Item Name" />
          <q-input v-model="form.category" label="Category" />
          <q-input v-model.number="form.price" label="Price" type="number" />
          <q-input v-model.number="form.stock" label="Stock" type="number" />
          <q-input v-if="form.category !== 'rice'" v-model="form.size" label="Size" />
          <q-uploader
            label="Upload Image"
            ref="uploaderRef"
            :auto-upload="false"
            accept="image/*"
            @added="onFileAdded"
            style="max-width: 100%"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="primary" label="Save" @click="saveItem" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useItemsStore } from '../stores/items'

const itemsStore = useItemsStore()

const columns = [
  { name: 'itemName', label: 'Item Name', field: 'itemName' },
  { name: 'category', label: 'Category', field: 'category' },
  { name: 'price', label: 'Price', field: 'price' },
  { name: 'stock', label: 'Stock', field: 'stock' },
  { name: 'size', label: 'Size', field: 'size' },
  { name: 'actions', label: 'Actions', field: 'actions', sortable: false, align: 'center' },
]

const dialogVisible = ref(false)
const isEditing = ref(false)
const form = ref({
  _id: null,
  itemName: '',
  category: '',
  price: 0,
  size: '',
})
const selectedFile = ref(null)
const uploaderRef = ref(null)

const search = ref('')

const filteredItems = computed(() => {
  if (!search.value) return itemsStore.items
  return itemsStore.items.filter((item) =>
    item.itemName.toLowerCase().includes(search.value.toLowerCase()),
  )
})

onMounted(() => {
  itemsStore.fetchItems()
})

function deleteItem(id) {
  itemsStore.deleteItem(id)
}

function editItem(item) {
  isEditing.value = true
  dialogVisible.value = true
  form.value = { ...item }
  selectedFile.value = null
}

function openAddDialog() {
  isEditing.value = false
  dialogVisible.value = true
  form.value = {
    _id: null,
    itemName: '',
    category: '',
    price: 0,
    stock: 0,
    size: '',
  }
  selectedFile.value = null
  uploaderRef.value.reset()
}

function onFileAdded(files) {
  if (files.length) {
    selectedFile.value = files[0]
  }
}

function saveItem() {
  const data = new FormData()
  data.append('itemName', form.value.itemName)
  data.append('category', form.value.category)
  data.append('price', form.value.price)
  data.append('stock', form.value.stock)
  data.append('stock', form.value.stock)

  if (form.value.category !== 'rice') {
    data.append('size', form.value.size)
  }
  if (selectedFile.value) {
    data.append('image', selectedFile.value)
  }

  if (isEditing.value && form.value._id) {
    itemsStore.editItem(form.value._id, data)
  } else {
    itemsStore.addItem(data)
  }

  dialogVisible.value = false
}
</script>
