Page({
  data: { keyword: '', results: [], searched: false },
  onLoad(options) { if (options.date) this.setData({ keyword: options.date }); this.search() },
  onInput(e) { this.setData({ keyword: e.detail.value }) },
  async search() {
    wx.showLoading({ title: '搜索中...' })
    const res = await wx.cloud.callFunction({ name: 'search', data: { keyword: this.data.keyword } })
    const results = (res.result.list || []).map(d => ({ ...d, content: (d.content || '').slice(0, 100) }))
    this.setData({ results, searched: true })
    wx.hideLoading()
  },
  go(e) { wx.navigateTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` }) },
})
