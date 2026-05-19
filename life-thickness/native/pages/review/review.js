Page({
  data: { review: null, history: [], loading: false },

  onShow() { this.loadHistory() },

  async loadHistory() {
    const res = await wx.cloud.callFunction({ name: 'review_list' })
    const list = res.result.list || []
    if (list.length) {
      this.setData({ review: list[0], history: list })
    }
  },

  showReview(e) {
    const idx = e.currentTarget.dataset.idx
    this.setData({ review: this.data.history[idx] })
  },

  async generate() {
    this.setData({ loading: true })
    try {
      const res = await wx.cloud.callFunction({ name: 'review_generate' })
      if (res.result.ok) {
        this.setData({ review: res.result.review })
        this.loadHistory()
      } else {
        wx.showModal({ title: '生成失败', content: res.result.error || '未知错误', showCancel: false })
      }
    } catch (err) {
      wx.showModal({ title: '调用失败', content: err.message || err.errMsg || '未知', showCancel: false })
    }
    this.setData({ loading: false })
  },
})
