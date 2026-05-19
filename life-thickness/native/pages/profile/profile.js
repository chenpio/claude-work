Page({
  data: {
    avatarUrl: '',
    nickName: '',
    hasProfile: false,
    tempAvatarUrl: '',
    diaryCount: 0,
    reviewCount: 0,
  },

  onShow() {
    this.loadProfile()
    this.loadStats()
  },

  async loadProfile() {
    try {
      var res = await wx.cloud.callFunction({ name: 'login' })
      if (res.result && res.result.user) {
        var u = res.result.user
        var hasProfile = !!(u.nickName || u.avatarUrl)
        this.setData({
          nickName: u.nickName || '',
          avatarUrl: u.avatarUrl || '',
          hasProfile: hasProfile,
        })
      }
    } catch (e) {}
  },

  async loadStats() {
    if (!this.data.hasProfile) return
    try {
      var res = await wx.cloud.callFunction({ name: 'diary_list', data: { pageSize: 1 } })
      var diaryCount = res.result.total || 0
      var reviewRes = await wx.cloud.callFunction({ name: 'review_list' })
      var reviewCount = (reviewRes.result.list || []).length
      this.setData({ diaryCount: diaryCount, reviewCount: reviewCount })
    } catch (e) {}
  },

  // 选择头像后，显示昵称输入框
  onChooseAvatar(e) {
    this.setData({ tempAvatarUrl: e.detail.avatarUrl })
  },

  // 昵称输入
  onNickInput(e) {
    this.setData({ nickName: e.detail.value })
  },

  // 用户点键盘确认键 → 自动保存
  async saveProfile() {
    var nickName = this.data.nickName
    var tempAvatarUrl = this.data.tempAvatarUrl

    if (!tempAvatarUrl || !nickName) {
      wx.showToast({ title: '请选择头像并输入昵称', icon: 'none' })
      return
    }
    wx.showLoading({ title: '登录中...' })
    try {
      var avatarUrl = this.data.avatarUrl
      if (tempAvatarUrl) {
        var cloudPath = 'avatars/' + Date.now() + '.jpg'
        var uploadRes = await wx.cloud.uploadFile({ cloudPath: cloudPath, filePath: tempAvatarUrl })
        avatarUrl = uploadRes.fileID
      }
      await wx.cloud.callFunction({
        name: 'login',
        data: { action: 'updateProfile', nickName: nickName, avatarUrl: avatarUrl }
      })
      wx.hideLoading()
      var app = getApp()
      app.globalData.hasProfile = true
      this.setData({ avatarUrl: avatarUrl, hasProfile: true, tempAvatarUrl: '' })
      wx.showToast({ title: '欢迎回来 ~', icon: 'success' })
    } catch (e) {
      wx.hideLoading()
      wx.showToast({ title: '登录失败', icon: 'none' })
    }
  },

  go(e) { wx.navigateTo({ url: e.currentTarget.dataset.url }) },

  async doExport() {
    wx.showLoading({ title: '导出中...' })
    var res = await wx.cloud.callFunction({ name: 'export' })
    wx.hideLoading()
    if (res.result.url) {
      wx.setClipboardData({ data: res.result.url })
      wx.showToast({ title: '导出链接已复制', icon: 'success' })
    }
  },
})
