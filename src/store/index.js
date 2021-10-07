import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    alertMessages: [],
    user: JSON.parse(
      sessionStorage.getItem('user') || localStorage.getItem('user')
    )
  },
  mutations: {
    alert (state, msg) {
      state.alertMessages.push(msg)
    },
    auth (state, payload) {
      state.user = payload.user;
      localStorage.setItem('user', JSON.stringify(payload.user));
      sessionStorage.removeItem('user')
    },
    logout (state) {
      state.user = null
      localStorage.removeItem('user')
      sessionStorage.removeItem('user')
    }
  },
  actions: {},
  modules: {}
})
