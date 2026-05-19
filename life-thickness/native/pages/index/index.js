const moodEmojis = ['', '😔', '🙁', '😐', '😊', '🥳']

Page({
  data: { diaries: [], loading: true },
  onShow() { this.loadDiaries() },
  async loadDiaries() {
    this.setData({ loading: true })
    try {
      const res = await wx.cloud.callFunction({ name: 'diary_list' })
      const list = (res.result.list || []).map(d => ({
        ...d,
        content: d.content ? d.content.slice(0, 120) : '',
        moodText: moodEmojis[d.mood] || '😐',
      }))
      this.setData({ diaries: list, loading: false })
    } catch { this.setData({ loading: false }) }
  },
  goWrite() { wx.navigateTo({ url: '/pages/write/write' }) },
  goDetail(e) { wx.navigateTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` }) },
  goTime() { wx.navigateTo({ url: '/pages/timeline/timeline' }) },
})
