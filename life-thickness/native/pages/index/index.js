const moodEmojis = ['', '😔', '🙁', '😐', '😊', '🥳']

Page({
  data: { diaries: [], loading: true, greeting: '' },

  onShow() {
    this.setGreeting()
    this.loadDiaries()
  },

  setGreeting() {
    const now = new Date()
    const h = now.getHours()
    let g = ''
    if (h < 10) g = '早上好'
    else if (h < 14) g = '中午好'
    else if (h < 19) g = '下午好'
    else g = '晚上好'
    const days = ['日','一','二','三','四','五','六']
    const dateStr = `${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日 星期${days[now.getDay()]}`
    this.setData({ greeting: `${g}，今天是${dateStr}` })
  },

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
