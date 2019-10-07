const HtmlWebPackPlugin = require("html-webpack-plugin");
let webpack = require('webpack');
let path = require('path')

module.exports = {
  entry: './src/index.js',

  mode: 'development',

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  },

  devServer: {
    contentBase: './dist',
    port: 3003,             // 端口
    open: true,             // 自动打开浏览器
    hot: true,               // 开启热更新
    disableHostCheck: true
  },

  output: {
    // 1. filename: 'bundle.js',
    // 2. [name]就可以将出口文件名和入口文件名一一对应
    filename: '[name].js',
    path: path.resolve(__dirname, '../dist')
  },

  plugins: [
    // html
    new HtmlWebPackPlugin({
      template: "./src/index.html",
      filename: "./index.html",
      hash: true, // 会在打包好的bundle.js后面加上类似于: ?6ce91c19b9054fff5a05 串
    }),
    
    new webpack.HotModuleReplacementPlugin()
  ]
};