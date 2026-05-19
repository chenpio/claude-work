Page({
  data: { settings: { diaryRemind: true, diaryRemindTime: '21:00', reviewRemind: true } },
  onSwitch(e) {
    const k = e.currentTarget.dataset.key
    const s = { ...this.data.settings }
    s[k] = e.detail.value
    this.setData({ settings: s })
  },
  onTime(e) {
    const k = e.currentTarget.dataset.key
    const s = { ...this.data.settings }
    s[k] = e.detail.value
    this.setData({ settings: s })
  },
  async save() {
    await wx.cloud.callFunction({ name: 'settings_update', data: { settings: this.data.settings } })
    wx.showToast({ title: '已保存', icon: 'success' })
  },
  async doExport() {
    wx.showLoading({ title: '导出中...' })
    const res = await wx.cloud.callFunction({ name: 'export' })
    wx.hideLoading()
    if (res.result.url) { wx.setClipboardData({ data: res.result.url }); wx.showToast({ title: '导出链接已复制', icon: 'success' }) }
  },
})
