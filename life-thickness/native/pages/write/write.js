const weathers = ['☀️晴','🌧️雨','☁️阴','❄️雪','🌫️雾','⛅多云','⚡雷电']
const moodList = [{v:1,e:'😔'},{v:2,e:'🙁'},{v:3,e:'😐'},{v:4,e:'😊'},{v:5,e:'🥳'}]
const allTags = ['工作','家庭','旅行','灵感','美食','运动','情绪','学习']

Page({
  data: {
    date: new Date().toISOString().split('T')[0],
    weather: '☀️晴',
    mood: 4,
    content: '',
    tags: [],
    oneLine: '',
    weathers, moodList, allTags,
    utils: { includes(arr, item) { return arr.indexOf(item) > -1 } },
  },
  onDate(e) { this.setData({ date: e.detail.value }) },
  setWeather(e) { this.setData({ weather: e.currentTarget.dataset.v }) },
  setMood(e) { this.setData({ mood: Number(e.currentTarget.dataset.v) }) },
  onContent(e) { this.setData({ content: e.detail.value }) },
  onOneLine(e) { this.setData({ oneLine: e.detail.value }) },
  toggleTag(e) {
    const v = e.currentTarget.dataset.v
    const tags = [...this.data.tags]
    const i = tags.indexOf(v)
    if (i > -1) tags.splice(i, 1)
    else if (tags.length < 5) tags.push(v)
    this.setData({ tags })
  },
  async save() {
    if (!this.data.content.trim()) { wx.showToast({ title: '请写点东西', icon: 'none' }); return }
    wx.showLoading({ title: '保存中...' })
    try {
      await wx.cloud.callFunction({ name: 'diary_create', data: {
        formData: { date: this.data.date, weather: this.data.weather, mood: this.data.mood, content: this.data.content, tags: this.data.tags, oneLine: this.data.oneLine, emotionTags: [], location: { city:'', district:'', hidden:false }, images: [] }
      }})
      wx.hideLoading()
      wx.showToast({ title: '已保存', icon: 'success' })
      setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 800)
    } catch { wx.hideLoading(); wx.showToast({ title: '保存失败', icon: 'error' }) }
  },
})
