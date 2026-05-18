import { createApp } from 'vue'
import Taro from '@tarojs/taro'
import './app.scss'

// 初始化云开发环境
Taro.cloud.init({
  env: 'cloudbase-d7g2pf9w6a94c6407',
})

const App = createApp({
  onShow() {
    // 自动登录
    Taro.cloud.callFunction({ name: 'login' }).catch(() => {})
  },
})

export default App
