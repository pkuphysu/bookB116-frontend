<template>
  <b-container>
    <h2>请登录</h2>
    <b-input-group>
      <b-form-input
        v-model="stuId"
        type="number"
        placeholder="学号"
        autofocus
      />
      <b-input-group-append>
        <b-button variant="primary" :disabled="!!countDown" @click="getCode">
          {{
            countDown === null
              ? '获取验证码'
              : countDown === 0
                ? '再次获取'
                : `稍等(${countDown})`
          }}
        </b-button>
      </b-input-group-append>
    </b-input-group>
    <b-form class="pt-3" @submit.prevent="login">
      <b-form-input
        id="vercode"
        v-model="vercode"
        type="number"
        placeholder="验证码"
        required
      />
      <b-form-checkbox id="checkbox" v-model="remember" name="remember">
        记住账号
      </b-form-checkbox>
      <b-button lg block variant="primary" type="submit">
        登录
      </b-button>
    </b-form>
  </b-container>
</template>

<script>
import { sleep } from '@/utils'
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
  data () {
    return {
      stuId: '',
      countDown: null,
      vercode: '',
      remember: false
    }
  },
  methods: {
    async getCode () {
      // Cool down even if fail
      // disable it first, or ueser will click twice
      this.countDown = 5
      await api.loginVercode(this.stuId)
      while (--this.countDown) await sleep(1000)
    },
    async login () {
      const resp = await api.login(this.vercode)
      if (resp) {
        this.$store.commit({
          type: 'login',
          user: resp.data.user,
          remember: this.remember
        })
        this.$router.push(this.from)
      }
    }
  }
}
</script>

<style></style>
