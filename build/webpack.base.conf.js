'use strict'
const path = require('path')
const utils = require('./utils')
const config = require('../config')
const vueLoaderConfig = require('./vue-loader.conf')

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}
// eslint 的 rule
const createLintingRule = () => ({
  test: /\.(js|vue)$/,
  loader: 'eslint-loader',
  enforce: 'pre',                              // pre 由于 eslint 的rule必须放在解析js前，为防止意外，加此参数
  include: [resolve('src'), resolve('test')],
  options: {
    formatter: require('eslint-friendly-formatter'),  // eslint插件 可以让eslint的错误信息出现在终端上
    emitWarning: !config.dev.showEslintErrorsInOverlay    // 为true时，eslint 的错会出现在浏览器端，false 则只出现在终端
  }
})

module.exports = {
  context: path.resolve(__dirname, '../'),    // 绝对地址，使用之后 entry 和 loaders 可以基于此地址写相对路径
  entry: {
    app: './src/main.js'
  },
  output: {
    path: config.build.assetsRoot,  // 输入路径
    filename: '[name].js',          // 输出的文件名
    publicPath: process.env.NODE_ENV === 'production'        // 引用外部image css js 资源被解析成外部的css js时，引入html时相对于html的baseUrl，想要使用cdn加速的，此项很有用
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'], // 引入扩展，当import资源时，可以省略的后缀
    alias: {  // 别名
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src'),
    }
  },
  module: {
    rules: [
      ...(config.dev.useEslint ? [createLintingRule()] : []),
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test'), resolve('node_modules/webpack-dev-server/client')]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,  // 阈值 10000b， 不超过则转化为 base64格式，超过则输入图片
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  },
  node: { 
    // prevent webpack from injecting useless setImmediate polyfill because Vue
    // source contains it (although only uses it if it's native).
    // 防止webpack注入无用的setImmediate polyfill，因为Vue源包含它（尽管只在它是原生的时才使用它）。
    setImmediate: false,
    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    // 防止webpack将 mock 注入到对客户端没有意义的Node本机模块
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  }
}
