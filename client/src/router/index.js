import { route } from 'quasar/wrappers'
import { getAuthInfo } from '../router/routes'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'

export default route(function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  Router.beforeEach((to, from, next) => {
    const { isAuthenticated, isAdmin, hasOpenedShift } = getAuthInfo()

    if (to.path === '/login') {
      if (isAuthenticated) {
        return next(isAdmin ? '/admin-dashboard' : '/dashboard')
      }
      return next()
    }

    if (to.meta.requiresAuth && !isAuthenticated) {
      return next('/login')
    }

    if (to.meta.adminOnly && !isAdmin) {
      return next('/openShift')
    }

    if (to.meta.userOnly && isAdmin) {
      return next('/admin-dashboard')
    }

    if (!isAdmin && hasOpenedShift && to.path === '/openShift') {
      return next('/dashboard')
    }

    if (!isAdmin && !hasOpenedShift && to.path !== '/openShift') {
      return next('/openShift')
    }

    next()
  })

  return Router
})

// Router.beforeEach((to, from, next) => {
//   const { isAuthenticated, isAdmin, hasOpenedShift } = getAuthInfo()

//   if (to.path === '/login') {
//     if (isAuthenticated) {
//       return next(isAdmin ? '/admin-dashboard' : '/openShift')
//     }
//     return next()
//   }

//   if (to.meta.requiresAuth && !isAuthenticated) {
//     return next('/login')
//   }

//   if (to.meta.adminOnly && !isAdmin) {
//     return next('/openShift')
//   }

//   if (to.meta.userOnly && isAdmin) {
//     return next('/admin-dashboard')
//   }

//   if (!isAdmin && !hasOpenedShift && to.path !== '/openShift') {
//     return next('/openShift')
//   }

//   next()
// })
