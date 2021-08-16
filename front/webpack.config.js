const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader',
        ]
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    // publicPath: '/api',
    // disableHostCheck: true,
    // 为每个静态资源开启gzip
    compress: true,
    port: 3000,
    disableHostCheck: true,
    // port: 4000,
    proxy: {
      // 例如将'localhost:8080/api/xxx'代理到'http://xxxxxxx.com/xxx'
      '/api/': {
        target: 'http://localhost:4000',
        // target: 'http://clivia.free.idcfengye.com',
        changeOrigin: true,
        pathRewrite: { '^/api': '' } // 这种接口配置出来 http://xxxxxx.com/xxx
      }
    }
    // proxy: [
    //   {
    //     context: ['/auth'],
    //     target: 'http://localhost:4000',
    //   }
    // ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: './index.html',
    })
  ]
}