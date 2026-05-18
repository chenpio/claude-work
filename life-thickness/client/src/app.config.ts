export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/write/index',
    'pages/detail/index',
    'pages/review/index',
    'pages/review/history',
    'pages/timeline/index',
    'pages/search/index',
    'pages/settings/index',
    'pages/profile/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FAF7F2',
    navigationBarTitleText: '人生厚度',
    navigationBarTextStyle: 'black',
    backgroundColor: '#FAF7F2',
  },
  tabBar: {
    color: '#9E9E9E',
    selectedColor: '#8B7F6E',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '日记',
        iconPath: 'assets/tab-home.png',
        selectedIconPath: 'assets/tab-home-active.png',
      },
      {
        pagePath: 'pages/write/index',
        text: '写日记',
        iconPath: 'assets/tab-write.png',
        selectedIconPath: 'assets/tab-write-active.png',
      },
      {
        pagePath: 'pages/review/index',
        text: '复盘',
        iconPath: 'assets/tab-review.png',
        selectedIconPath: 'assets/tab-review-active.png',
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/tab-profile.png',
        selectedIconPath: 'assets/tab-profile-active.png',
      },
    ],
  },
})
