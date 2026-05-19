Page({
  data: { year: 0, month: 0, days: [], diaryDates: {} },
  onShow() {
    const d = new Date()
    this.setData({ year: d.getFullYear(), month: d.getMonth() + 1 })
    this.loadDates()
    this.buildDays()
  },
  async loadDates() {
    const res = await wx.cloud.callFunction({ name: 'diary_dates' })
    const diaryDates = {}
    ;(res.result.dates || []).forEach(d => { diaryDates[d] = true })
    this.setData({ diaryDates })
    this.buildDays()
  },
  buildDays() {
    const { year, month, diaryDates } = this.data
    const firstDay = new Date(year, month - 1, 1).getDay()
    const lastDate = new Date(year, month, 0).getDate()
    const today = new Date().toISOString().split('T')[0]
    const startPad = firstDay === 0 ? 6 : firstDay - 1
    const days = []
    for (let i = 0; i < startPad; i++) days.push({ day: '', date: '', hasDiary: false, isToday: false })
    for (let d = 1; d <= lastDate; d++) {
      const date = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`
      days.push({ day: d, date, hasDiary: !!diaryDates[date], isToday: date === today })
    }
    this.setData({ days })
  },
  prev() { const m = this.data.month - 1; if (m < 1) this.setData({ year: this.data.year - 1, month: 12 }); else this.setData({ month: m }); this.buildDays() },
  next() { const m = this.data.month + 1; if (m > 12) this.setData({ year: this.data.year + 1, month: 1 }); else this.setData({ month: m }); this.buildDays() },
  goDay(e) { const d = e.currentTarget.dataset.date; if (d) wx.navigateTo({ url: `/pages/search/search?date=${d}` }) },
  async random() {
    const res = await wx.cloud.callFunction({ name: 'diary_random' })
    if (res.result.diary) wx.navigateTo({ url: `/pages/detail/detail?id=${res.result.diary._id}` })
    else wx.showToast({ title: '还没有日记', icon: 'none' })
  },
})
