import Vue from 'vue'
import App from '@/App.vue'
import './registerServiceWorker'
import router from '@/router'
import store from '@/store'
import { i18n } from '@/plugins/i18n.js'
import axios from 'axios'

import {
  BadgePlugin,
  ButtonPlugin,
  CardPlugin,
  FormPlugin,
  FormInputPlugin,
  FormGroupPlugin,
  FormSelectPlugin,
  FormTextareaPlugin,
  InputGroupPlugin,
  ImagePlugin,
  LayoutPlugin,
  ModalPlugin,
  NavbarPlugin,
  PaginationPlugin,
  SpinnerPlugin,
  TablePlugin,
  TabsPlugin,
  TooltipPlugin,
  ListGroupPlugin,
  ToastPlugin,
  FormFilePlugin
} from 'bootstrap-vue'

Vue.config.productionTip = false

Vue.use(BadgePlugin)
Vue.use(ButtonPlugin)
Vue.use(CardPlugin)
Vue.use(FormPlugin)
Vue.use(FormInputPlugin)
Vue.use(FormGroupPlugin)
Vue.use(FormSelectPlugin)
Vue.use(FormTextareaPlugin)
Vue.use(FormFilePlugin)
Vue.use(InputGroupPlugin)
Vue.use(ImagePlugin)
Vue.use(LayoutPlugin)
Vue.use(ListGroupPlugin)
Vue.use(ModalPlugin)
Vue.use(NavbarPlugin)
Vue.use(PaginationPlugin)
Vue.use(SpinnerPlugin)
Vue.use(TablePlugin)
Vue.use(TabsPlugin)
Vue.use(ToastPlugin)
Vue.use(TooltipPlugin)

// Set base URL
let baseUrl = './api/'
if (process.env.VUE_APP_BASE_URL) {
  baseUrl = process.env.VUE_APP_BASE_URL
}
axios.defaults.baseURL = baseUrl

store.commit('ON_SERVER_URL_CHANGED', baseUrl)

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
