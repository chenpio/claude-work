Page({
  data: {
    savedNickName: '',
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
      if (res.result && res.result.user && res.result.user.nickName) {
        this.setData({ savedNickName: res.result.user.nickName })
      }
    } catch (e) {}
  },

  async loadStats() {
    try {
      var res = await wx.cloud.callFunction({ name: 'diary_list', data: { pageSize: 1 } })
      var diaryCount = res.result.total || 0
      var reviewRes = await wx.cloud.callFunction({ name: 'review_list' })
      var reviewCount = (reviewRes.result.list || []).length
      this.setData({ diaryCount: diaryCount, reviewCount: reviewCount })
    } catch (e) {}
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
