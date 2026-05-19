const weatherLabels = ['☀️晴','🌧️雨','☁️阴','❄️雪','🌫️雾','⛅多云','⚡雷电']
const moodList = [{v:1,e:'😔'},{v:2,e:'🙁'},{v:3,e:'😐'},{v:4,e:'😊'},{v:5,e:'🥳'}]
const tagLabels = ['工作','家庭','旅行','灵感','美食','运动','情绪','学习']

Page({
  data: {
    date: new Date().toISOString().split('T')[0],
    weatherList: weatherLabels.map((l,i) => ({ label: l, selected: i === 0 })),
    moodList: moodList.map((m,i) => ({ ...m, selected: i === 3 })),
    content: '',
    allTags: tagLabels.map(t => ({ label: t, selected: false })),
    oneLine: '',
  },
  onDate(e) { this.setData({ date: e.detail.value }) },
  setWeather(e) {
    const idx = e.currentTarget.dataset.idx
    const list = this.data.weatherList.map((item, i) => ({ ...item, selected: i === idx }))
    this.setData({ weatherList: list })
  },
  setMood(e) {
    const idx = e.currentTarget.dataset.idx
    const list = this.data.moodList.map((item, i) => ({ ...item, selected: i === idx }))
    this.setData({ moodList: list })
  },
  toggleTag(e) {
    const idx = e.currentTarget.dataset.idx
    const list = [...this.data.allTags]
    if (list.filter(t => t.selected).length < 5 || list[idx].selected) {
      list[idx] = { ...list[idx], selected: !list[idx].selected }
      this.setData({ allTags: list })
    }
  },
  onContent(e) { this.setData({ content: e.detail.value }) },
  onOneLine(e) { this.setData({ oneLine: e.detail.value }) },
  async save() {
    if (!this.data.content.trim()) { wx.showToast({ title: '请写点东西', icon: 'none' }); return }
    wx.showLoading({ title: '保存中...' })
    try {
      const weather = this.data.weatherList.find(w => w.selected)?.label || '☀️晴'
      const mood = this.data.moodList.find(m => m.selected)?.v || 4
      const tags = this.data.allTags.filter(t => t.selected).map(t => t.label)
      const res = await wx.cloud.callFunction({ name: 'diary_create', data: {
        formData: { date: this.data.date, weather, mood, content: this.data.content, tags, oneLine: this.data.oneLine, emotionTags: [], location: { city:'', district:'', hidden:false }, images: [] }
      }})
      console.log('save result:', res)
      wx.hideLoading()
      wx.showToast({ title: '已保存', icon: 'success' })
      setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 800)
    } catch (err) {
      console.error('save error:', err)
      wx.hideLoading()
      wx.showToast({ title: '保存失败: ' + (err.message || err.errMsg || '未知'), icon: 'none', duration: 3000 })
    }
  },
})
