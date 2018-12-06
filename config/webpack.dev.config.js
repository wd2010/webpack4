const merge = require('webpack-merge');
const base = require('./webpack.base.config');
const plugin = require('./plugin.js')
const path = require('path');
const rootPath=path.join(__dirname,'../');

const devConfig = merge(base,{
  devtool: 'source-map',
  mode: 'development',
  output: {
    filename: "[name].js",
    path: path.resolve(rootPath, "./dist"),
    publicPath: "/",
  },
  devServer:{
    hot:true,
    host: '0.0.0.0',
    historyApiFallback:true,
    compress: true,
    watchOptions: {
      poll: false,
    }
  },
  plugins:[
    plugin.hrm(),
  ],
})

module.exports=devConfig;