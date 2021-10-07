<template>
  <b-container fluid>
    <b-row>
      <b-col cols="12" class="mb-4">
        <p>预约须知：</p>
        <ol>
          <li>
            使用教室须提前预约。
            <!-- 预约时须再邀请 2 名同学并通知他们确认，才能预约成功。
            未能提前 {{ BOOK_DAY_NEAREST }} - {{ BOOK_DAY_FARTHEST }} 天完成确认的，
            视为放弃预约。 -->
          </li>
          <li>如要取消预约或修改预约，请提前取消原有预约。</li>
        </ol>
        <div class="text-right">
          <router-link to="/html/howto">
            Read More...
          </router-link>
        </div>
      </b-col>
      <b-col cols="12">
        <b-button
          v-if="bookCount < 2"
          to="/book"
          variant="primary"
          block
        >
          新建预约
        </b-button>
        <b-button v-else variant="primary" block disabled>
          预约已达上限
        </b-button>
      </b-col>
    </b-row>
    <b-col
      v-for="bookRecord in bookRecords"
      :key="bookRecord.id"
      cols="12"
      class="py-2"
    >
      <BookRecord :record="bookRecord" @change="refresh" />
    </b-col>
  </b-container>
</template>

<script>
import BookRecord from '@/components/BookRecord'
import api from '@/api'
import { BOOK_DAY_NEAREST, BOOK_DAY_FARTHEST } from '@/consts'

export default {
  name: 'BookingIndex',
  components: {
    BookRecord
  },
  data () {
    return {
      BOOK_DAY_NEAREST,
      BOOK_DAY_FARTHEST,
      bookCount: 0,
      bookRecords: []
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    }
  },
  async created () {
    await this.refresh()
  },
  methods: {
    async refresh () {
      const response = await api.bookingStatus()
      if (!response) return
      this.bookCount = response.data.bookCount
      this.bookRecords = response.data.bookRecords
    }
  }
}
</script>

<style></style>
