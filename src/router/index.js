import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import store from '@/store'
import { loadLanguageAsync } from '@/plugins/i18n'

const emitter = require('tiny-emitter/instance')

Vue.use(VueRouter)

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
    component: () => import(/* webpackChunkName: "user" */ '@/views/UserView')
  },
  {
    path: '/user/:userId',
    name: 'user-details',
    component: () => import(/* webpackChunkName: "user" */ '@/views/UserView')
  },
  {
    path: '/about',
    name: 'about',
    component: () => import(/* webpackChunkName: "about" */ '@/views/AboutView')
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
