import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'login',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "login" */ '@/views/Login'),
    meta: {
      title: '登录',
      loginRequired: false
    },
    beforeEnter: (to, from, next) => {
      // visiting '/login' when logged in
      if (store.state.user) next('/')
      else next()
    }
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import(/* webpackChunkName: "login" */ '@/views/Auth'),
    meta: {
      title: '正在认证中~',
      loginRequired: false
    }
  },
  {
    path: '/',
    name: 'bookingIndex',
    component: () =>
      import(/* webpackChunkName: "bookingIndex" */ '@/views/BookingIndex'),
    meta: {
      title: '预约主界面',
      loginRequired: true
    }
  },
  {
    path: '/book',
    name: 'bookingMain',
    component: () =>
      import(/* webpackChunkName: "bookingMain" */ '@/views/BookingMain'),
    meta: {
      title: '预约中',
      loginRequired: true
    }
  },
  {
    path: '/html/:src',
    name: 'markdownView',
    props: true,
    component: () =>
      import(/* webpackChunkName: "markdown" */ '@/views/MarkdownView'),
    meta: {
      title: '查看文档',
      loginRequired: false
    }
  },
  {
    path: '*',
    name: 'error',
    component: () => import(/* webpackChunkName: "error" */ '@/views/Error'),
    meta: {
      title: '这里什么也没有',
      loginRequired: false
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.afterEach(to => {
  Vue.nextTick(() => {
    document.title = to.meta.title || ''
  })
})

router.beforeEach((to, from, next) => {
  if (to.meta.loginRequired && !store.state.user) {
    store.commit({
      type: 'alert',
      text: '请先登录',
      variant: 'info'
    })
    next({
      path: '/login',
      from: from.path
    })
  } else next()
})

export default router
