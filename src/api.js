/* eslint-disable camelcase */
import axios from 'axios'
import store from './store'
import router from './router'
import { TRANSLATION } from './consts'

const flashMsgs = resp => {
  if (!resp) {
    store.commit({
      type: 'alert',
      text: TRANSLATION['Network Error'],
      variant: 'danger'
    })
    return
  }
  let msgs = resp.data.message
  const code = resp.status
  if (code === 403 && msgs === 'Unauthorized') {
    store.commit('logout')
    router.push('/login')
  }
  if (!msgs) {
    if (code !== 200) {
      store.commit({
        type: 'alert',
        text: TRANSLATION['Fatal Error'],
        variant: 'warning'
      })
    }
    return
  }
  if (!Array.isArray(msgs)) msgs = [msgs]
  for (const msg of msgs) {
    store.commit({
      type: 'alert',
      text:
        msg in TRANSLATION
          ? TRANSLATION[msg]
          : code !== 200
            ? code + ' ' + msg
            : msg,
      variant: code === 200 ? 'info' : 'danger'
    })
  }
}

const requestApi = async (method, url, login, data) => {
  url = process.env.VUE_APP_API_ROOT + url
  const u = store.state.user
  if (login === true) {
    if (url.includes('?')) url += '&'
    else url += '?'
    url += `id=${escape(u.id)}&timestamp=${u.timestamp}`
  }
  let resp
  try {
    resp = await axios({ method, url, data, withCredentials: true })
  } catch (err) {
    flashMsgs(err.response)
    return false
  }
  flashMsgs(resp)
  return resp
}

export default {
  vercode: async () => {
    const rawId = store.state.user.rawId
    return await requestApi('get', '/api/vercode?rawId=' + rawId, true)
  },
  login: async () => await requestApi('get', '/api/login', false),
  auth: async queryString =>
    await requestApi('post', '/api/auth', false, { queryString }),
  fullLogout: async => requestApi('get', '/api/logout', true),
  bookingStatus: async () => {
    const resp = await requestApi('get', '/api/booking/my', true)
    if (!resp) return false
    for (const record of resp.data.bookRecords) {
      record.startTime *= 1000
      record.endTime *= 1000
      record.bookTime *= 1000
    }
    return resp
  },
  bookingAll: async () => await requestApi('get', '/api/booking/all', true),
  book: async data => {
    const rawId = store.state.user.rawId
    return (
      await requestApi('post', '/api/booking/book?rawId=' + rawId, true, data)
    )
  },
  cancel: async (book_id, vercode) =>
    await requestApi('post', '/api/booking/cancel', true, { book_id, vercode })
  // confirm: async book_id =>
  //   await requestApi('post', '/api/booking/confirm', true, { book_id })
  // confirm 功能已被取消
}
