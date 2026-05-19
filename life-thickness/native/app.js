App({
  globalData: {
    hasProfile: false,
  },

  onLaunch() {
    if (!wx.cloud) return
    wx.cloud.init({ env: 'cloud1-d5ge5ii4tcce8e0fe', traceUser: true })
    this.checkAuth()
  },

  async checkAuth() {
    try {
      var res = await wx.cloud.callFunction({ name: 'login' })
      if (res.result && res.result.user && (res.result.user.nickName || res.result.user.avatarUrl)) {
        this.globalData.hasProfile = true
      }
    } catch (e) {}
  },

  // 供页面调用的授权检查
  requireAuth() {
    if (!this.globalData.hasProfile) {
      wx.switchTab({ url: '/pages/profile/profile' })
      wx.showToast({ title: '请先设置头像和昵称', icon: 'none' })
      return false
    }
    return true
  },
})
