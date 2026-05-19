Page({
  go(e) { wx.navigateTo({ url: e.currentTarget.dataset.url }) },
  async doExport() {
    wx.showLoading({ title: '导出中...' })
    const res = await wx.cloud.callFunction({ name: 'export' })
    wx.hideLoading()
    if (res.result.url) {
      wx.setClipboardData({ data: res.result.url })
      wx.showToast({ title: '导出链接已复制', icon: 'success' })
    }
  },
})
