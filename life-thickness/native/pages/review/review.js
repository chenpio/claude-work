Page({
  data: { review: null, loading: false },
  async generate() {
    this.setData({ loading: true })
    try {
      const res = await wx.cloud.callFunction({ name: 'review_generate' })
      if (res.result.ok) this.setData({ review: res.result.review })
      else wx.showToast({ title: res.result.error || '生成失败，请先写日记', icon: 'none' })
    } catch { wx.showToast({ title: '生成失败', icon: 'none' }) }
    this.setData({ loading: false })
  },
})
