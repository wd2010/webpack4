const merge = require('webpack-merge');
const base = require('./webpack.base.config');
const plugin = require('./plugin.js');
const path = require('path');
const rootPath=path.join(__dirname,'../');

const generateAnalyzer=process.env.npm_config_report;// --report

const prodConfig = merge(base, {
  mode: "production",
  output: {
    filename: "js/[name].[contenthash].js",
    path: path.resolve(rootPath, "./dist"),
    publicPath: "/",
    chunkFilename: "js/[name].[contenthash].js"
  },
  optimization: {
    /*https://github.com/yesvods/Blog/issues/15*/
    // namedChunks: true,
    // moduleIds: "hashed",
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        libs: {
          name: "libs",
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: "initial" // 只打包初始时依赖的第三方
        },
        elementUI: {
          name: "antdUi", // 单独将 elementUI 拆包
          priority: 20, // 权重要大于 libs 和 app 不然会被打包进 libs 或者 app
          test: /[\\/]node_modules[\\/]antd[\\/]/
        },
        commons: {
          test: /[\\/]src[\\/]/,
          name: "commons",
          minSize: 300,
          minChunks: 3, // 最小公用次数
          chunks: "initial",
          priority: 5,
          reuseExistingChunk: true // 这个配置允许我们使用已经存在的代码块
        }
      }
    },
    runtimeChunk: "single",
    minimizer: [plugin.purifyCss(), plugin.optimizeCSS(), plugin.uglify()]
  },

  plugins: [
    plugin.clean(),
    generateAnalyzer && plugin.analyzer(),
    plugin.inlineManifest(),
    plugin.loadable(),
    plugin.extractCSS(),
    plugin.NamedModulesPlugin(),
    plugin.NamedChunksPlugin(),
    plugin.loadable(),
  ].filter(p => p)
});

module.exports=prodConfig;