App({
  globalData: { hasProfile: false },

  onLaunch() {
    if (!wx.cloud) return
    wx.cloud.init({ env: 'cloud1-d5ge5ii4tcce8e0fe', traceUser: true })
    // 静默初始化用户，不拦截任何页面
    wx.cloud.callFunction({ name: 'login' }).then(function (res) {
      if (res.result && res.result.user) {
        var app = getApp()
        app.globalData.hasProfile = !!(res.result.user.nickName || res.result.user.avatarUrl)
      }
    }).catch(function () {})
  },
})
