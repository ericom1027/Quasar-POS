<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-1">
    <q-page-container>
      <q-page class="q-pa-lg flex flex-center">
        <q-card
          flat
          bordered
          class="q-pa-xl"
          style="
            width: 420px;
            max-width: 90vw;
            border-radius: 12px;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
          "
        >
          <q-card-section class="q-mb-md">
            <div class="text-h4 text-center text-primary" style="font-weight: 700">Close Shift</div>
          </q-card-section>

          <q-card-section>
            <q-input
              v-model.number="endingCash"
              label="Ending Cash"
              type="number"
              min="0"
              outlined
              dense
              autofocus
              :rules="[(val) => (val !== null && val >= 0) || 'Please enter a valid cash amount']"
              clearable
              class="q-mb-md"
              input-class="text-body1"
              color="primary"
              style="font-weight: 600"
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancel" color="primary" @click="cancel" />

            <q-btn
              flat
              label="Close Shift"
              color="primary"
              :disable="endingCash === null || endingCash < 0"
              @click="handleCloseShift"
            />
          </q-card-actions>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useShiftStore } from '../stores/shiftStore'
import { useAuthStore } from '../stores/authStore'
import { useRouter } from 'vue-router'
const router = useRouter()

const endingCash = ref(null)
const shiftStore = useShiftStore()
const authStore = useAuthStore()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

function handleCloseShift() {
  shiftStore.closeShift({ endingCash: endingCash.value }).then(() => {
    handleLogout()
  })
}

function cancel() {
  router.push('/dashboard')
}
</script>
