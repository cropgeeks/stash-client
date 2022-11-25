const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: false,
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  pwa: {
    name: 'STASH',
    themeColor: '#1289A7',
    msTileColor: '#ffffff',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',
    start_url: '/index.html',
    workboxOptions: {
      skipWaiting: true
    }
  },
  configureWebpack: {
    // plugins: [
    //   new BundleAnalyzerPlugin()
    // ],
    devtool: 'eval-source-map',
    target: 'web'
  }
})
