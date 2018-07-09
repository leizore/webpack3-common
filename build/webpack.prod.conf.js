'use strict'
const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const env = require('../config/prod.env')

const webpackConfig = merge(baseWebpackConfig, {
  module: {
    // utils.styleLoaders 生成的 less css scss 等的 loader
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true,
      usePostCSS: true
    })
  },
  devtool: config.build.productionSourceMap ? config.build.devtool : false,
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[name].[chunkhash].js'),
    chunkFilename: utils.assetsPath('js/[id].[chunkhash].js')  //打包引入的chunk块的名字
  },
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': env
    }),
    // 代码压缩
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: {
          warnings: false
        }
      },
      sourceMap: config.build.productionSourceMap,
      parallel: true   // 开启并行压缩，多进程，更快速
    }),
    // extract css into its own file
    new ExtractTextPlugin({    // 从js中 抽取 css 生成单独的文件
      filename: utils.assetsPath('css/[name].[contenthash].css'),
      // Setting the following option to `false` will not extract CSS from codesplit chunks.
      // Their CSS will instead be inserted dynamically with style-loader when the codesplit chunk has been loaded by webpack.
      // It's currently set to `true` because we are seeing that sourcemaps are included in the codesplit bundle as well when it's `false`, 
      // increasing file size: https://github.com/vuejs-templates/webpack/issues/1110
      allChunks: true,
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    // 压缩提取的css，并且抽取css公共部分，防止css重复打包
    new OptimizeCSSPlugin({
      cssProcessorOptions: config.build.productionSourceMap
        ? { safe: true, map: { inline: false } }
        : { safe: true }
    }),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({  // 生成html
      filename: config.build.index,
      template: 'index.html',
      inject: true,
      minify: {
        removeComments: true,    // 去除注释
        collapseWhitespace: true,  // 去除文本节点的空白
        removeAttributeQuotes: true  // 去掉双引号
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      // 使用 CommonsChunkPlugin 插件的必要设置，允许设置 chunks 插入 html 的方式，默认 auto
      chunksSortMode: 'dependency' 
    }),
    // keep module.id stable when vendor modules does not change
    // 当 module 没有改变时，维持 module.id 不变，从而最终生成的js的hash不变，根据浏览器的缓存策略，可以实现浏览器的长效缓存
    new webpack.HashedModuleIdsPlugin(),
    // enable scope hoisting
    // 过去 webpack 打包时的一个取舍是将 bundle 中各个模块单独打包成闭包。这些打包函数使你的 JavaScript 在浏览器中处理的更慢。相比之下，此插件提升(hoist)或者预编译所有模块到一个闭包中，提升你的代码在浏览器中的执行速度。
    new webpack.optimize.ModuleConcatenationPlugin(),
    // split vendor js into its own file
    // 把你在项目中引用 node_modules 包里的 js 打包到你的项目中
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks (module) {
        // any required modules inside node_modules are extracted to vendor
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            path.join(__dirname, '../node_modules')
          ) === 0
        )
      }
    }),
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    // 当完成打包并发送到浏览器时，会在运行时通过 Manifest 来解析和加载模块。只是修改模块内的内容的话，生成的manifest.js的hash值不变
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      minChunks: Infinity
    }),
    // This instance extracts shared chunks from code splitted chunks and bundles them
    // in a separate chunk, similar to the vendor chunk
    // see: https://webpack.js.org/plugins/commons-chunk-plugin/#extra-async-commons-chunk
    // 业务代码分割
    new webpack.optimize.CommonsChunkPlugin({
      name: 'app',
      async: 'vendor-async',
      children: true,
      minChunks: 3
    }),

    // copy custom static assets
    // 将 static 目录拷贝到dist目录里
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.build.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ]
})

if (config.build.productionGzip) {  // 是否开启 gzip，开启之后会除了生成该有的js， 还会生成对应的 .gz 文件，使用 在服务器端 nginx或者其他工具开启gzip的gzip_static配置，可以让浏览器直接返回 .gz文件，从而减少体积优化性能
  const CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
        config.build.productionGzipExtensions.join('|') +
        ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}

if (config.build.bundleAnalyzerReport) {   // npm run build --report 时，会生成依赖图，更加直观的看到你所有的依赖及大小
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
