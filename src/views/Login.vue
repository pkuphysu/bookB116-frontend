<template>
  <div class="text-center mt-4">
    <div>
      正在转至北大物院身份认证平台，请稍候……
    </div>
    <div>
      Hint: 如果跳转失败可以刷新一下~
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
    this.Redirect()
  },
  methods: {
    async Redirect () {
      const resp = await api.login()
      if (resp) {
        const url = resp.data.url
        window.location.replace(url)
      }
    }
  }
}
</script>

<style></style>
