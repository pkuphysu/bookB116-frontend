import '@babel/polyfill'
import 'mutationobserver-shim'
import Vue from 'vue'
import './plugins/bootstrap-vue'
import './plugins/vue-formulate'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  methods: {
    loginRequired() {
      if (!store.state.user) {
        store.commit({
          type: 'alert',
          text: '请先登录',
          varaint: 'info'
        })
        router.push('/login')
      }
    }
  },
  render: h => h(App)
}).$mount('#app')
