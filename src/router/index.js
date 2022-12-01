import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
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
    path: '/about',
    name: 'about',
    component: () => import(/* webpackChunkName: "about" */ '@/views/AboutView')
  }
]

const router = new VueRouter({
  routes
})

export default router
