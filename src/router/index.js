import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import store from '@/store'
import { loadLanguageAsync } from '@/plugins/i18n'
import { userIsAtLeast } from '@/plugins/api/auth'

const emitter = require('tiny-emitter/instance')

Vue.use(VueRouter)

const tokenIsValid = (token) => {
  if (token) {
    return new Date().getTime() - token.createdOn <= token.lifetime
  } else {
    return false
  }
}

const loggedIn = (token) => {
  return token !== null && tokenIsValid(token)
}

const requireAuth = (to, from, next) => {
  const token = store.getters.storeToken

  emitter.emit('show-loading', false)

  // If we're in full auth mode, check credentials for each call
  if (!loggedIn(token)) {
    next({ name: 'login' })
    return
  } else if (to.meta && to.meta.minUserType && (!token || !userIsAtLeast(token.userType, to.meta.minUserType))) {
    next({ name: '403' })
    return
  }

  next()
}

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    component: () => import(/* webpackChunkName: "login" */ '@/views/LoginView')
  },
  {
    path: '/import',
    name: 'import',
    component: () => import(/* webpackChunkName: "import" */ '@/views/ImportView')
  },
  {
    path: '/transfer',
    name: 'transfer',
    component: () => import(/* webpackChunkName: "transfer" */ '@/views/TransferView')
  },
  {
    path: '/predefine',
    name: 'predefine',
    component: () => import(/* webpackChunkName: "predefine" */ '@/views/PredefineView')
  },
  {
    path: '/user',
    name: 'user',
    meta: { minUserType: 'admin' },
    component: () => import(/* webpackChunkName: "user" */ '@/views/UserView'),
    beforeEnter: requireAuth
  },
  {
    path: '/user/:userId',
    name: 'user-details',
    meta: { minUserType: 'admin' },
    component: () => import(/* webpackChunkName: "user" */ '@/views/UserView'),
    beforeEnter: requireAuth
  },
  {
    path: '/about',
    name: 'about',
    component: () => import(/* webpackChunkName: "about" */ '@/views/AboutView')
  },
  {
    path: '/403',
    name: '403',
    component: () => import(/* webpackChunkName: "error-403" */ '@/views/Page403.vue')
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  emitter.emit('set-search-visible', false)
  loadLanguageAsync(store.getters.storeLocale).then(() => next())
})

export default router
