const weatherLabels = ['☀️','🌧️','☁️','❄️','🌫️','⛅','⚡']
const moodList = [{v:1,e:'😔'},{v:2,e:'🙁'},{v:3,e:'😐'},{v:4,e:'😊'},{v:5,e:'🥳'}]
const tagLabels = ['工作','家庭','旅行','灵感','美食','运动','情绪','学习']

Page({
  data: {
    date: new Date().toISOString().split('T')[0],
    weatherList: weatherLabels.map((l,i) => ({ label: l, selected: i === 0 })),
    moodList: moodList.map((m,i) => ({ ...m, selected: i === 3 })),
    content: '',
    images: [],
    location: '',
    allTags: tagLabels.map(t => ({ label: t, selected: false })),
    showTags: false,
    oneLine: '',
    autoFocus: false,
  },
  onLoad() { this.setData({ autoFocus: true }) },
  onShow() {},
  toggleTags() { this.setData({ showTags: !this.data.showTags }) },
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
  onContent(e) { this.setData({ content: e.detail.value }) },
  toggleTag(e) {
    const idx = e.currentTarget.dataset.idx
    const list = [...this.data.allTags]
    if (list.filter(t => t.selected).length < 5 || list[idx].selected) {
      list[idx] = { ...list[idx], selected: !list[idx].selected }
      this.setData({ allTags: list })
    }
  },
  getLocation() {
    var that = this
    wx.chooseLocation({
      success: function (res) {
        var loc = res.address || res.name || ''
        if (loc) that.setData({ location: loc })
        else wx.showToast({ title: '未获取到位置', icon: 'none' })
      },
      fail: function () {
        wx.showToast({ title: '已取消', icon: 'none' })
      }
    })
  },
  addImage() {
    const remain = 9 - this.data.images.length
    wx.chooseImage({
      count: remain, sizeType: ['compressed'],
      success: async (res) => {
        wx.showLoading({ title: '上传中...' })
        const newImages = [...this.data.images]
        for (const path of res.tempFilePaths) {
          try {
            const cloudPath = `diary-images/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`
            const upload = await wx.cloud.uploadFile({ cloudPath, filePath: path })
            newImages.push({ fileId: upload.fileID, url: upload.fileID })
          } catch (e) {}
        }
        this.setData({ images: newImages.slice(0, 9) })
        wx.hideLoading()
      },
    })
  },
  previewImage(e) {
    const idx = e.currentTarget.dataset.idx
    wx.previewImage({ current: this.data.images[idx].url, urls: this.data.images.map(i => i.url) })
  },
  delImage(e) {
    const idx = e.currentTarget.dataset.idx
    const images = [...this.data.images]
    images.splice(idx, 1)
    this.setData({ images })
  },
  async save() {
    if (!this.data.content.trim() && !this.data.images.length) {
      wx.showToast({ title: '写点什么吧', icon: 'none' }); return
    }
    wx.showLoading({ title: '保存中...' })
    try {
      const weather = this.data.weatherList.find(w => w.selected)?.label || '☀️'
      const mood = this.data.moodList.find(m => m.selected)?.v || 4
      const tags = this.data.allTags.filter(t => t.selected).map(t => t.label)
      await wx.cloud.callFunction({ name: 'diary_create', data: {
        formData: {
          date: this.data.date, weather, mood,
          location: { city: this.data.location, district: '', hidden: false },
          content: this.data.content, images: this.data.images,
          tags, oneLine: this.data.oneLine, emotionTags: [],
        }
      }})
      wx.hideLoading()
      wx.showToast({ title: '已保存 ~', icon: 'success' })
      // 清空表单，留在当前页继续写
      this.setData({
        content: '', images: [], oneLine: '', location: '',
        date: new Date().toISOString().split('T')[0],
        allTags: tagLabels.map(function (t) { return { label: t, selected: false } }),
        moodList: moodList.map(function (m, i) { return Object.assign({}, m, { selected: i === 3 }) }),
        weatherList: weatherLabels.map(function (l, i) { return { label: l, selected: i === 0 } }),
      })
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  },
})
