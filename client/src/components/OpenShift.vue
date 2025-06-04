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
            <div class="text-h4 text-center text-primary" style="font-weight: 700">Open Shift</div>
          </q-card-section>

          <q-card-section>
            <q-input
              v-model="startingCash"
              label="Starting Cash"
              type="number"
              min="0"
              outlined
              dense
              autofocus
              :rules="[
                (val) =>
                  (!isNaN(parseFloat(val)) && parseFloat(val) >= 0) ||
                  'Please enter a valid cash amount',
              ]"
              clearable
              class="q-mb-md"
              input-class="text-body1"
              color="primary"
              style="font-weight: 600"
            >
              <template v-slot:prepend>
                <span style="font-weight: bold; font-size: 1em">₱</span>
              </template>
            </q-input>
          </q-card-section>

          <q-card-actions align="right" class="q-pt-sm">
            <q-btn
              flat
              label="Cancel"
              color="grey-6"
              text-color="black"
              @click="handleLogout"
              class="q-mr-sm"
              unelevated
              rounded
              style="min-width: 100px"
            />
            <q-btn
              label="Open Shift"
              color="primary"
              :disable="!isValidCash"
              @click="handleOpenShift"
              unelevated
              rounded
              style="min-width: 120px"
            />
          </q-card-actions>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useShiftStore } from '../stores/shiftStore'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const startingCash = ref('')
const shiftStore = useShiftStore()
const router = useRouter()
const authStore = useAuthStore()

const isValidCash = computed(() => {
  const val = parseFloat(startingCash.value)
  return !isNaN(val) && val >= 0
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

async function handleOpenShift() {
  const cash = parseFloat(startingCash.value)
  if (isNaN(cash) || cash < 0) return

  await shiftStore.openShift({ startingCash: cash })
  localStorage.setItem('hasOpenedShift', 'true')
  startingCash.value = ''
  router.push('/dashboard')
}

// function cancel() {
//   startingCash.value = null
// }
</script>
