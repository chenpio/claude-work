const moodEmojis = ['', '😔', '🙁', '😐', '😊', '🥳']

Page({
  data: { diary: null },
  onLoad(options) {
    this.loadDiary(options.id)
  },
  async loadDiary(id) {
    const res = await wx.cloud.callFunction({ name: 'diary_detail', data: { id } })
    const d = res.result.diary
    d.moodText = moodEmojis[d.mood] || '😐'
    this.setData({ diary: d })
  },
  preview(e) {
    const idx = e.currentTarget.dataset.idx
    wx.previewImage({ current: this.data.diary.images[idx].url, urls: this.data.diary.images.map(i => i.url) })
  },
  edit() { wx.navigateTo({ url: `/pages/write/write?id=${this.data.diary._id}` }) },
  async del() {
    const r = await new Promise(resolve => wx.showModal({ title: '确认删除', content: '确定删除这篇日记吗？', success: resolve }))
    if (r.confirm) {
      await wx.cloud.callFunction({ name: 'diary_delete', data: { id: this.data.diary._id } })
      wx.showToast({ title: '已删除', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 800)
    }
  },
})
