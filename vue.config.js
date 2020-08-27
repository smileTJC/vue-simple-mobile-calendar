const autoprefixer = require('autoprefixer')
const pxtoviewport = require('postcss-px-to-viewport')
module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',
  css: {
    loaderOptions: {
      postcss: {
        plugins: [
          autoprefixer(),
          pxtoviewport({ 
            viewportWidth: 375
          })
        ]
      }
    },
    extract: false
  },
  devServer: {
    port: 9090
  },
  pages: {
    index: {
      entry: 'examples/main.ts',
      template: 'public/index.html',
      filename: 'index.html'
    }
  },
  productionSourceMap: false
}