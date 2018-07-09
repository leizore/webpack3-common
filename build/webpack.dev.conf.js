'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const path = require('path')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portfinder = require('portfinder')

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

const devWebpackConfig = merge(baseWebpackConfig, {
  module: {
    // utils.styleLoaders 生成的 less css scss 等的loader
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: config.dev.devtool,  // 是否生成，以及如何生成 source map。

  // these devServer options should be customized in /config/index.js
  devServer: {
    clientLogLevel: 'warning',
    historyApiFallback: {
      rewrites: [
        { from: /.*/, to: path.posix.join(config.dev.assetsPublicPath, 'index.html') },
      ],
    },
    hot: true,     // 是否开启热更新
    contentBase: false, // since we use CopyWebpackPlugin. // 告诉服务器从哪里提供内容。只有在你想要提供静态文件时才需要。devServer.publicPath 将用于确定应该从哪里提供 bundle，并且此选项优先。这里设置为false，是因为下面使用了CopyWebpackPlugin插件
    compress: true,  // 一切服务都启用gzip 压缩
    host: HOST || config.dev.host,
    port: PORT || config.dev.port,
    open: config.dev.autoOpenBrowser,  // 是否自动打开浏览器
    overlay: config.dev.errorOverlay   // 为true时，当存在编译错误或警告时，  在浏览器中显示并全屏覆盖
      ? { warnings: false, errors: true }
      : false,
    publicPath: config.dev.assetsPublicPath,  // 此路径下的打包文件可在浏览器中访问。
    proxy: config.dev.proxyTable,             // 代理，开发环境中可以使用此项跨域掉接口
    quiet: true, // necessary for FriendlyErrorsPlugin    FriendlyErrorsPlugin 插件必须的。启用 quiet 后，除了初始启动信息之外的任何内容都不会被打印到控制台。这也意味着来自 webpack 的错误或警告在控制台不可见。
    watchOptions: {      // webpack 使用文件系统获取文件改动的通知。
      poll: config.dev.poll,
    }
  },
  plugins: [
    new webpack.DefinePlugin({   // 定义环境变量，开发的代码中 可以通过 process.env 访问，可以根据此项来区分正式还是测试环境
      'process.env': require('../config/dev.env')
    }),
    new webpack.HotModuleReplacementPlugin(),     // HMR 热更新替换插件
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update. HMR 热更新时可以打印具体哪一个组件更新了
    new webpack.NoEmitOnErrorsPlugin(),   // 在编译出现错误时，使用 NoEmitOnErrorsPlugin 来跳过输出阶段。这样可以确保输出资源不会包含错误。
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({   // 用来生成 html，你懂得
      filename: 'index.html',
      template: 'index.html',
      inject: true
    }),
    // copy custom static assets
    new CopyWebpackPlugin([  // 拷贝静态资源 
      {
        from: path.resolve(__dirname, '../static'),
        to: config.dev.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ]
})
// 暴露一个异步操作，会在 webpack-dev-server 中会接收并执行
module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port  // 打开浏览器的端口号
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      // 端口被占用时就重新设置evn和devServer的端口
      process.env.PORT = port  
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({  // 这个插件是用来把webpack的错误和日志收集起来，漂亮的展示给用户
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`], // 构建完成时，输出
        },
        onErrors: config.dev.notifyOnErrors   // 当运行时出现错误，更加友好的提示错误
        ? utils.createNotifierCallback()
        : undefined
      }))

      resolve(devWebpackConfig)
    }
  })
})
