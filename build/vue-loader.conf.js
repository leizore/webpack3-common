'use strict'
const utils = require('./utils')
const config = require('../config')
const isProduction = process.env.NODE_ENV === 'production'
const sourceMapEnabled = isProduction
  ? config.build.productionSourceMap
  : config.dev.cssSourceMap

module.exports = {
  loaders: utils.cssLoaders({            // .vue 文件内的less、css、scss解析方式
    sourceMap: sourceMapEnabled,
    extract: isProduction
  }),
  cssSourceMap: sourceMapEnabled, // 是否启用cssSourceMap
  cacheBusting: config.dev.cacheBusting,
  transformToRequire: {  // 编译器可以将某些特性转换为 require 调用，例如 src 中的 URL。因此这些目标资源可以被 webpack 处理。例如 <img src="./foo.png"> 会找到你文件系统中的 ./foo.png 并将其作为一个依赖包含在你的包里。
    video: ['src', 'poster'],
    source: 'src',
    img: 'src',
    image: 'xlink:href'
  }
}
