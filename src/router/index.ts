/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHashHistory } from 'vue-router'
import { setupLayouts } from 'virtual:generated-layouts'
import { routes } from 'vue-router/auto-routes'
import type { Token } from '@/plugins/types/stash'
import { userIsAtLeast } from '@/plugins/api/auth'

import emitter from 'tiny-emitter/instance'
import { coreStore } from '@/stores/app'

function tokenIsValid (token?: Token) {
  if (token) {
    return Date.now() - token.createdOn <= token.lifetime
  } else {
    return false
  }
}

function loggedIn (token?: Token) {
  return token !== undefined && tokenIsValid(token)
}

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
  scrollBehavior (to, from, savedPosition) {
    return new Promise(resolve => {
      setTimeout(() => {
        if (savedPosition) {
          // Restore scroll position
          resolve(savedPosition)
        } else if (from && to && from.path === to.path) {
          // Do nothing?
          resolve()
        } else {
          // Scroll to top
          resolve({ left: 0, top: 0 })
        }
      }, 250)
    })
  },
})

router.beforeEach((to, from, next) => {
  if (to.path !== '/login') {
    const store = coreStore()
    const token = store.storeToken

    emitter.emit('show-loading', false)

    // If we're in full auth mode, check credentials for each call
    if (to.meta && to.meta.minUserType) {
      if (!token) {
        next('/login')
        return
        // @ts-ignore
      } else if (!userIsAtLeast(token.userType, to.meta.minUserType)) {
        next('/403')
        return
      } else {
        next()
        return
      }
    }

    next()
  } else {
    next()
  }
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', err)
    } else {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
