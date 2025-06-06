<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header -->
    <q-header elevated>
      <q-toolbar style="background-color: green">
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-space />

        <q-btn
          v-if="authStore.user && authStore.user.isAdmin === false"
          flat
          dense
          @click="$router.push('/dashboard')"
        >
          <q-icon name="shopping_cart" size="24px" />
          <q-badge v-if="cartStore.totalItems > 0" floating color="red" transparent class="q-ml-xs">
            {{ cartStore.totalItems }}
          </q-badge>
        </q-btn>

        <q-btn flat>
          <q-avatar size="30px" color="red" text-color="white" class="shadow-4">
            {{ userFirstLetter }}
          </q-avatar>

          <span class="q-ml-sm">{{ userFirstName }}</span>
          <q-icon name="arrow_drop_down" class="q-ml-xs" />

          <q-menu transition-show="rotate" transition-hide="rotate">
            <q-list style="min-width: 180px">
              <!-- Settings -->
              <q-item clickable @click="toggleSettings">
                <q-item-section>Settings</q-item-section>
                <q-item-section side>
                  <q-icon :name="showSettings ? 'keyboard_arrow_up' : 'keyboard_arrow_down'" />
                </q-item-section>
              </q-item>

              <q-slide-transition>
                <div v-if="showSettings">
                  <q-item>
                    <q-item-section>Dark Mode</q-item-section>
                    <q-item-section side>
                      <q-toggle :model-value="isDark" @update:model-value="toggleDarkMode" />
                    </q-item-section>
                  </q-item>
                </div>
              </q-slide-transition>

              <q-separator />

              <!-- Sign out -->
              <q-item clickable @click="handleLogout">
                <q-item-section>Sign out</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- Sidebar / Drawer -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label
          header
          class="full-width"
          style="display: flex; align-items: center; justify-content: center; gap: 10px"
        >
          <img
            alt="Razons logo"
            src="/Razons.png"
            style="max-width: 90px; animation: rotate 8s linear infinite; caret-color: transparent"
          />
          <span class="text-title"> Point of Sales </span>
        </q-item-label>

        <!-- Links based on role -->
        <EssentialLink v-for="link in filteredLinks" :key="link.title" v-bind="link" />

        <!-- Reports dropdown for admin only -->
        <q-expansion-item
          v-if="authStore.user?.isAdmin"
          expand-separator
          icon="bar_chart"
          label="Reports"
          :model-value="openedExpansion === 'reports'"
          @update:model-value="(val) => toggleExpansion('reports', val)"
        >
          <q-list>
            <q-item clickable v-ripple @click="navigateAndClose('/get-attendance')">
              <q-item-section avatar>
                <q-icon name="group" />
              </q-item-section>
              <q-item-section>Attendance Reports</q-item-section>
            </q-item>

            <q-item clickable v-ripple @click="navigateAndClose('/sales-cashier')">
              <q-item-section avatar>
                <q-icon name="account_circle" />
              </q-item-section>
              <q-item-section>Cashier Sales Report</q-item-section>
            </q-item>

            <q-item clickable v-ripple @click="navigateAndClose('/daily-sales-report')">
              <q-item-section avatar>
                <q-icon name="description" />
              </q-item-section>
              <q-item-section>Daily Sales Report</q-item-section>
            </q-item>

            <q-item clickable v-ripple @click="navigateAndClose('/weekly-sales')">
              <q-item-section avatar>
                <q-icon name="date_range" />
              </q-item-section>
              <q-item-section>Weekly Sales Report</q-item-section>
            </q-item>

            <q-item clickable v-ripple @click="navigateAndClose('/monthly-sales')">
              <q-item-section avatar>
                <q-icon name="calendar_month" />
              </q-item-section>
              <q-item-section>Monthly Sales Report</q-item-section>
            </q-item>

            <q-item clickable v-ripple @click="navigateAndClose('/item-sold-report')">
              <q-item-section avatar>
                <q-icon name="shopping_cart" />
              </q-item-section>
              <q-item-section>Daily Items Sold</q-item-section>
            </q-item>

            <q-item clickable v-ripple @click="navigateAndClose('/Shiftlist')">
              <q-item-section avatar>
                <q-icon name="access_time" />
              </q-item-section>
              <q-item-section>Shift History</q-item-section>
            </q-item>

            <q-item clickable v-ripple @click="navigateAndClose('/daily-expenses')">
              <q-item-section avatar>
                <q-icon name="wallet" />
              </q-item-section>
              <q-item-section>Expenses</q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
      </q-list>
    </q-drawer>

    <!-- Page Content -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/authStore'
import { useCartStore } from 'stores/cart'

const cartStore = useCartStore()
const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

const userFirstName = computed(() => authStore.user?.firstname || 'User')
const userFirstLetter = computed(() =>
  authStore.user?.firstname ? authStore.user.firstname.charAt(0).toUpperCase() : '?',
)

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

const isDark = ref(localStorage.getItem('darkMode') === 'true')
const showSettings = ref(false)
const leftDrawerOpen = ref(false)
const openedExpansion = ref('')

onMounted(() => {
  $q.dark.set(isDark.value)
  if ($q.screen.gt.sm) {
    leftDrawerOpen.value = false
  }
})

const toggleDarkMode = () => {
  isDark.value = !isDark.value
  $q.dark.set(isDark.value)
  localStorage.setItem('darkMode', isDark.value)
}

const toggleSettings = () => {
  showSettings.value = !showSettings.value
}

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function toggleExpansion(name, val) {
  if (val) {
    openedExpansion.value = name
  } else {
    openedExpansion.value = ''
  }
}

function navigateAndClose(path) {
  openedExpansion.value = ''
  router.push(path)
}

const linksList = ref([
  { title: 'Dashboard', icon: 'dashboard', link: '/admin-dashboard' },
  { title: 'Dashboard', icon: 'dashboard', link: '/dashboard' },
  { title: 'Bills', icon: 'attach_money', link: '/billsPage' },
  { title: 'Close Shift', icon: 'close', link: '/closeShift' },

  { title: 'Items', icon: 'description', link: '/items' },
  { title: 'Manage Users', icon: 'account_circle', link: '/users' },
])

// Filter links based on isAdmin
const filteredLinks = computed(() => {
  if (!authStore.user) return []

  const isAdmin = authStore.user.isAdmin

  if (isAdmin) {
    return [linksList.value[0], linksList.value[2], linksList.value[4], linksList.value[5]]
  } else {
    return [linksList.value[1], linksList.value[3]]
  }
})
</script>
