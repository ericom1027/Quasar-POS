function getAuthInfo() {
  const token = localStorage.getItem('accessToken')
  return {
    token,
    isAuthenticated: !!token,
    isAdmin: JSON.parse(localStorage.getItem('isAdmin') || 'false'),
    hasOpenedShift: localStorage.getItem('hasOpenedShift') === 'true',
  }
}

const routes = [
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
  },
  {
    path: '/',
    redirect: () => {
      const { token, isAdmin } = getAuthInfo()
      if (!token) return '/login'
      return isAdmin ? '/admin-dashboard' : '/openShift'
    },
  },

  // Admin Routes
  {
    path: '/admin-dashboard',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/AdminDashboard.vue'),
        meta: { requiresAuth: true, adminOnly: true },
      },
    ],
  },
  {
    path: '/items',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/ItemsPage.vue'),
        meta: { requiresAuth: true, adminOnly: true },
      },
    ],
  },
  {
    path: '/ShiftList',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/ShiftList.vue'),
        meta: { requiresAuth: true, adminOnly: true },
      },
    ],
  },
  {
    path: '/get-attendance',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/AttendancePage.vue'),
        meta: { requiresAuth: true, adminOnly: true },
      },
    ],
  },

  {
    path: '/users',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/UserManagement.vue'),
        meta: { requiresAuth: true, adminOnly: true },
      },
    ],
  },

  {
    path: '/daily-sales-report',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/DailySalesPage.vue'),
        meta: { requiresAuth: true, adminOnly: true },
      },
    ],
  },

  {
    path: '/weekly-sales',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/WeekLySales.vue'),
        meta: { requiresAuth: true, adminOnly: true },
      },
    ],
  },

  {
    path: '/monthly-sales',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/MonthlySalesPage.vue'),
        meta: { requiresAuth: true, adminOnly: true },
      },
    ],
  },

  {
    path: '/sales-cashier',
    name: 'sales-cashier',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/CashierDailySales.vue'),
        meta: { requiresAuth: true, adminOnly: true },
      },
    ],
  },

  {
    path: '/item-sold-report',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/DailyItemsSold.vue'),
        meta: { requiresAuth: true, adminOnly: true },
      },
    ],
  },

  // User Routes
  {
    path: '/dashboard',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/UserDashboard.vue'),
        meta: { requiresAuth: true, userOnly: true },
      },
    ],
  },
  {
    path: '/billsPage',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/BillsList.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },

  {
    path: '/openShift',
    component: () => import('layouts/OpenLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/OpenShift.vue'),
        meta: { requiresAuth: true, userOnly: true },
      },
    ],
  },
  {
    path: '/closeShift',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/CloseShift.vue'),
        meta: { requiresAuth: true, userOnly: true },
      },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
export { getAuthInfo }
