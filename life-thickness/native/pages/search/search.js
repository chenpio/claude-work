Page({
  data: { keyword: '', results: [], searched: false, searchDate: '' },
  onLoad(options) {
    if (options.date) {
      this.setData({ searchDate: options.date, keyword: options.date })
    }
    this.search()
  },
  onInput(e) { this.setData({ keyword: e.detail.value }) },
  async search() {
    wx.showLoading({ title: '搜索中...' })
    var data = { keyword: this.data.keyword }
    if (this.data.searchDate) {
      data.dateStart = this.data.searchDate
      data.dateEnd = this.data.searchDate
    }
    var res = await wx.cloud.callFunction({ name: 'search', data: data })
    var results = (res.result.list || []).map(function (d) { return Object.assign({}, d, { content: (d.content || '').slice(0, 100) }) })
    this.setData({ results: results, searched: true })
    wx.hideLoading()
  },
  go(e) { wx.navigateTo({ url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id }) },
})
