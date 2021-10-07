<template>
  <div role="tablist">
    <b-card no-body class="mb-1">
      <b-card-header header-tag="header" class="p-1" role="tab">
        <b-button v-b-toggle.accordion-1 block href="#" variant="info">
          选择日期 [{{ formatDateAhead(selectedDayIndex + BOOK_DAY_NEAREST) }}]
        </b-button>
      </b-card-header>
      <b-collapse
        id="accordion-1"
        v-model="accordion[0]"
        accordion="my-accordion"
        role="tabpanel"
      >
        <b-card-body>
          <b-table-simple id="date-picker" bordered>
            <b-tbody>
              <b-tr id="date-content">
                <b-td
                  v-for="i in BOOK_DAY_FARTHEST - BOOK_DAY_NEAREST + 1"
                  :key="i"
                  class="px-0 text-center"
                  :class="{
                    'td-selected': selectedDayIndex === i - 1
                  }"
                  @click="daySelected(i - 1)"
                >
                  {{ formatDateAhead(i + BOOK_DAY_NEAREST - 1) }}
                </b-td>
              </b-tr>
            </b-tbody>
          </b-table-simple>
        </b-card-body>
      </b-collapse>
    </b-card>

    <b-card no-body class="mb-1">
      <b-card-header header-tag="header" class="p-1" role="tab">
        <b-button v-b-toggle.accordion-2 block href="#" variant="info">
          选择房间
          <span v-if="selectedRoomTime">
            {{ B116ROOMS[selectedRoomTime.room] }}
            {{ selectedRoomTime.time[0] }}:00 -
            {{ selectedRoomTime.time[1] }}:50
          </span>
        </b-button>
      </b-card-header>
      <b-collapse
        id="accordion-2"
        v-model="accordion[1]"
        accordion="my-accordion"
        role="tabpanel"
      >
        <table-select
          ref="table"
          :selected-day-index="selectedDayIndex"
          @selected="timeSelected"
        />
        <div class="text-center">
          <p>Hint: 可拖动选中以一次性预约多个连续时间段</p>
        </div>
      </b-collapse>
    </b-card>

    <b-card no-body class="mb-1">
      <b-card-header header-tag="header" class="p-1" role="tab">
        <b-button v-b-toggle.accordion-3 block href="#" variant="info">
          预约信息填写
        </b-button>
      </b-card-header>
      <b-collapse
        id="accordion-3"
        v-model="accordion[2]"
        accordion="my-accordion"
        role="tabpanel"
      >
        <b-card-body>
          <form-builder ref="form" schema="booking" />
        </b-card-body>
        <b-collapse v-model="vercodeVisible">
          <b-input-group>
            <b-form-input
              v-model="vercode"
              type="number"
              placeholder="验证码已发送至您的北大邮箱"
            />
            <b-input-group-append>
              <b-button variant="outline-dark" @click="sendVercode">
                {{ countDown === 0 ? '再次获取' : `稍等(${countDown})` }}
              </b-button>
            </b-input-group-append>
          </b-input-group>
        </b-collapse>
        <b-button variant="primary" block @click="submit">
          Submit
        </b-button>
      </b-collapse>
    </b-card>
  </div>
</template>

<script>
import { VBToggle } from 'bootstrap-vue'
import CONSTS from '@/consts'
import { sleep } from '@/utils'
import TableSelect from '@/components/TableSelect'
import FormBuilder from '@/components/FormBuilder'
import api from '@/api'

const today = new Date().setHours(0, 0, 0, 0)

export default {
  name: 'BookingMain',
  components: {
    TableSelect,
    FormBuilder
  },
  directives: {
    'b-toggle': VBToggle
  },
  data () {
    return {
      selectedDayIndex: 0,
      selectedRoomTime: null,
      accordion: [true, false, false],
      vercodeVisible: false,
      countDown: null,
      vercode: '',
      ...CONSTS
    }
  },
  methods: {
    formatDateAhead (delta) {
      const d = new Date(today + delta * 86400000)
      return `${d.getMonth() + 1}-${d.getDate()}`
    },
    timeSelected (data) {
      this.selectedRoomTime = data
    },
    daySelected (i) {
      this.accordion[1] = true
      if (this.selectedDayIndex !== i) {
        this.selectedDayIndex = i
        this.selectedRoomTime = null
      }
      // Somewhat like raw bootstrap,
      // BV does not open accordion,
      // if I selected the same date
      this.$forceUpdate()
    },
    async submit () {
      if (this.vercodeVisible === false) {
        // Varify form and request vercode
        if (await this.requestBook(true)) {
          this.sendVercode()
          this.vercodeVisible = true
        }
      } else {
        // Verify vercode and final submit
        if (await this.requestBook()) this.$router.push('/')
      }
    },
    async sendVercode () {
      this.countDown = 5
      await api.vercode()
      while (--this.countDown) await sleep(1000)
    },
    /**
     * Core method in this view.
     * Take current status and send a request of booking to te server
     * @param {boolean} [test=false] - Testing request or real request
     * @returns {boolean} If server thinks the request is valid
     */
    async requestBook (test) {
      // Client side varification
      const formValues = await this.$refs.form.values()
      if (!formValues) {
        return false
      }
      if (this.selectedRoomTime == null) {
        this.$store.commit({
          type: 'alert',
          text: '请选择好房间和时间后提交'
        })
        return false
      }
      if (!test && this.vercode.length !== 4) {
        this.$store.commit({
          type: 'alert',
          text: '请正确填写验证码',
          variant: 'danger'
        })
        return
      }

      // Then construct the request
      const now = new Date()
      const bookingDay = new Date(
        +now + (this.selectedDayIndex + this.BOOK_DAY_NEAREST) * 86400000
      )
      let [start, end] = this.selectedRoomTime.time
      start = new Date(+bookingDay).setHours(start, 0, 0, 0) / 1000
      end = new Date(+bookingDay).setHours(end, 50, 0, 0) / 1000
      const data = {
        room_id: this.selectedRoomTime.room,
        start,
        end,
        ...formValues,
        test,
        vercode: this.vercode
      }
      return await api.book(data)
    }
  }
}
</script>

<style></style>
