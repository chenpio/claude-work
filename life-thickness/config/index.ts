const path = require('path')

const config = {
  projectName: 'life-thickness',
  date: '2026-5-18',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
  },
  sourceRoot: 'client/src',
  outputRoot: 'dist/weapp',
  plugins: [
    '@tarojs/plugin-framework-vue3',
    '@tarojs/plugin-platform-weapp',
    '@tarojs/plugin-platform-h5',
    '@tarojs/plugin-html',
  ],
  alias: {
    '@': path.resolve(__dirname, '..', 'client/src'),
  },
  defineConstants: {},
  copy: {
    patterns: [],
    options: {},
  },
  framework: 'vue3',
  compiler: 'webpack5',
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {},
      },
      cssModules: {
        enable: false,
      },
    },
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    postcss: {
      autoprefixer: {
        enable: true,
        config: {},
      },
    },
  },
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
