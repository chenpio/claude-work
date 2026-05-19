Page({
  data: {
    avatarUrl: '',
    nickName: '',
    hasProfile: false,
    tempAvatarUrl: '',
    diaryCount: 0,
    totalWords: 0,
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
        this.setData({
          nickName: u.nickName || '',
          avatarUrl: u.avatarUrl || '',
          hasProfile: !!(u.nickName || u.avatarUrl),
        })
      }
    } catch (e) {}
  },

  async loadStats() {
    try {
      var res = await wx.cloud.callFunction({ name: 'diary_list', data: { pageSize: 1 } })
      var diaryCount = res.result.total || 0
      var reviewRes = await wx.cloud.callFunction({ name: 'review_list' })
      var reviewCount = (reviewRes.result.list || []).length
      // 粗略计算总字数（实际应该在后端统计）
      var totalWords = diaryCount > 0 ? '...' : '0'
      this.setData({ diaryCount: diaryCount, totalWords: totalWords, reviewCount: reviewCount })
    } catch (e) {}
  },

  onChooseAvatar(e) {
    this.setData({ tempAvatarUrl: e.detail.avatarUrl })
  },

  onNickInput(e) {
    this.setData({ nickName: e.detail.value })
  },

  async saveProfile() {
    if (!this.data.tempAvatarUrl && !this.data.nickName) {
      wx.showToast({ title: '请设置头像或昵称', icon: 'none' })
      return
    }
    wx.showLoading({ title: '保存中...' })
    try {
      var avatarUrl = this.data.avatarUrl
      if (this.data.tempAvatarUrl) {
        // 上传头像到云存储
        var cloudPath = 'avatars/' + Date.now() + '.jpg'
        var uploadRes = await wx.cloud.uploadFile({ cloudPath: cloudPath, filePath: this.data.tempAvatarUrl })
        avatarUrl = uploadRes.fileID
      }
      await wx.cloud.callFunction({
        name: 'login',
        data: { action: 'updateProfile', nickName: this.data.nickName, avatarUrl: avatarUrl }
      })
      wx.hideLoading()
      this.setData({ avatarUrl: avatarUrl, hasProfile: true, tempAvatarUrl: '' })
      wx.showToast({ title: '已保存 ~', icon: 'success' })
    } catch (e) {
      wx.hideLoading()
      wx.showToast({ title: '保存失败', icon: 'none' })
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
