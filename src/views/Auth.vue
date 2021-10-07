<template>
  <div class="text-center mt-4">
    <div>
      正在认证身份，请稍候……
    </div>
    <div>
      Hint: 如果跳转失败请点击上方“预约主页”~
    </div>
  </div>
</template>

<script>
import api from '@/api'

export default {
  name: 'Login',
  props: {
    from: {
      type: String,
      required: false,
      default: '/'
    }
  },
  created () {
    this.auth()
  },
  methods: {
    async auth () {
      const queryString = window.location.search
      const resp = await api.auth(queryString)
      if (resp) {
        this.$store.commit({
          type: 'auth',
          user: resp.data.user
        })
        this.$router.push(this.from)
      }
    }
  }
}
</script>

<style></style>
