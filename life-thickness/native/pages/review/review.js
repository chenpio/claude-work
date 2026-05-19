Page({
  data: { review: null, loading: false },
  async generate() {
    this.setData({ loading: true })
    try {
      const res = await wx.cloud.callFunction({ name: 'review_generate' })
      if (res.result.ok) {
        this.setData({ review: res.result.review })
      } else {
        wx.showModal({ title: '生成失败', content: res.result.error || '未知错误', showCancel: false })
      }
    } catch (err) {
      wx.showModal({ title: '调用失败', content: err.message || err.errMsg || '未知', showCancel: false })
    }
    this.setData({ loading: false })
  },
})
