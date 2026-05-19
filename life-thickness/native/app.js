App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('云开发未启用，请在开发者工具中开通')
      return
    }
    wx.cloud.init({
      env: 'cloud1-d5ge5ii4tcce8e0fe',
      traceUser: true,
    })
    console.log('云开发初始化完成')
  },
})
