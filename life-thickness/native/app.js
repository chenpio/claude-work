App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('云开发未启用，请在开发者工具中开通')
      return
    }
    wx.cloud.init({
      env: 'cloudbase-d7g2pf9w6a94c6407',
      traceUser: true,
    })
    console.log('云开发初始化完成')
  },
})
