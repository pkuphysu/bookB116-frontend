<template>
  <b-list-group>
    <b-list-group-item>
      <b-badge
        pill
        :variant="badge.variant"
        class="float-left"
        style="font-size: 0.9em"
      >
        {{ badge.text }}
      </b-badge>
      <h5 class="d-inline-block ml-1 mb-0">
        {{ B116ROOMS[record.roomId] }}
      </h5>
      <b-button
        v-if="userId == sponsorId && !record.canceled"
        variant="outline-primary"
        class="float-right p-0"
        :disabled="!!countDown"
        @click="cancel"
      >
        {{
          countDown === null
            ? '取消'
            : countDown === 0
              ? '再次获取'
              : `稍等(${countDown})`
        }}
      </b-button>
    </b-list-group-item>
    <b-collapse :visible="countDown !== null">
      <b-input-group>
        <b-form-input
          v-model="vercode"
          type="number"
          placeholder="验证码将发至您的北大邮箱"
        />
        <b-input-group-append>
          <b-button variant="outline-dark" @click="submit">
            提交
          </b-button>
        </b-input-group-append>
      </b-input-group>
    </b-collapse>
    <b-list-group-item class="booking-detail">
      <p>预约时间：{{ formatTimeRange(record.startTime, record.endTime) }}</p>
      <p>
        发起人：{{ record.sponsor }} ({{
          record.confirmStatus[0].rawStudentId
        }})
      </p>
      <p>发起时间：{{ formatTime(record.bookTime) }}</p>
      <p>参与人数：{{ record.studentNumber }}</p>
      <p>用途：{{ record.description }}</p>
    </b-list-group-item>
    <b-list-group-item
      v-for="student in record.confirmStatus.slice(1)"
      :key="student.studentId"
    >
      参与人：{{ student.rawStudentId }}
      <b-button
        v-if="student.confirmed"
        variant="outline-success"
        class="float-right p-0"
        disabled
      >
        已确认
      </b-button>
      <span v-else-if="!dead && !record.canceled">
        <b-button
          v-if="student.studentId == userId"
          variant="outlined-primary"
          class="float-right p-0"
          @click="confirm"
        >确认</b-button>
        <b-button
          v-else
          variant="outline-warning"
          class="float-right p-0"
          disabled
        >等待确认</b-button>
      </span>
      <b-button
        v-else
        variant="outline-danger"
        class="float-right p-0"
        disabled
      >
        未确认
      </b-button>
    </b-list-group-item>
  </b-list-group>
</template>

<script>
import { format } from 'light-date'
import { BOOK_DAY_NEAREST, B116ROOMS } from '@/consts'
import { sleep } from '@/utils'
import api from '@/api'

const now = new Date().getTime()
const today = new Date().setHours(0, 0, 0, 0)
const cancelDDL = today + BOOK_DAY_NEAREST * 86400000

export default {
  props: {
    record: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      vercode: '',
      countDown: null,
      B116ROOMS
    }
  },
  computed: {
    userId () {
      return this.$store.state.user.id
    },
    sponsorId () {
      return this.record.confirmStatus[0].studentId
    },
    dead () {
      return this.record.startTime < cancelDDL
    },
    badge () {
      if (this.record.canceled) {
        return {
          variant: 'danger',
          text: '已取消'
        }
      } else if (this.record.confirmed) {
        let text
        if (now > this.record.endTime) text = '已完成'
        else if (now < this.record.startTime) text = '成功预约'
        else text = '正在进行'
        return {
          variant: 'success',
          text
        }
      } else if (this.dead) {
        return {
          variant: 'danger',
          text: '预约失败'
        }
      } else {
        return {
          variant: 'info',
          text: '等待确认'
        }
      }
    }
  },
  watch: {
    'record.canceled' () {
      this.countDown = null
    }
  },
  methods: {
    async cancel () {
      this.countDown = 3
      await api.vercode()
      while (--this.countDown) await sleep(1000)
    },
    async submit () {
      const resp = await api.cancel(this.record.id, this.vercode)
      this.vercode = ''
      if (resp) this.$emit('change')
    },
    async confirm () {
      if (await api.confirm(this.record.id)) this.$emit('change')
    },
    formatTime (time) {
      return format(new Date(time), '{yyyy}-{MM}-{dd} {HH}:{mm}')
    },
    formatTimeRange (startTime, endTime) {
      return format(
        new Date(endTime),
        `${this.formatTime(startTime)} 至 {HH}:{mm}`
      )
    }
  }
}
</script>

<style>
.booking-detail {
  font-size: 0.9em;
}
.booking-detail p {
  margin: 0;
}
</style>
