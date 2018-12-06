const path = require('path')
const rootPath=path.join(__dirname,'../');
const os = require('os');
const webpack = require('webpack');
const internalIp = require('internal-ip');
const HappyPack = require('happypack')
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length })
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

const CleanWebpackPlugin = require("clean-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const WebpackParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin');
const { ReactLoadablePlugin } =require('react-loadable/webpack') ;
const PreloadPlugin = require('preload-webpack-plugin');

const glob = require('glob');
const purifyCssPlugin = require('purifycss-webpack');

const isDev=process.env.NODE_ENV==='development'

/************************base**************************************/
exports.happyPackBabel=()=>{
  //http://blog.yunfei.me/blog/happypack_webpack_booster.html
  return new HappyPack({
    // 用唯一的标识符 id 来代表当前的 HappyPack 是用来处理一类特定的文件
    id: 'babel',
    // 如何处理 .js 文件，用法和 Loader 配置中一样
    loaders: [
      {
        loader: 'babel-loader',
        options: {
          //HappyPack 实现了一个基本文件修改时间戳的缓存。
          // 在每次编译的同时会将每个源文件对应的编译结果缓存下来，
          // 同时记录下源文件的修改时间戳。下次编译时，先读取源文件的修改时间戳，
          // 跟之前的缓存信息做对比，时间戳没有变化，则直接读取缓存文件作为
          // Loader 结果返回。就是这么简单
          cacheDirectory: path.resolve('.cache/babel'),
          babelrc: true
        }
      }
    ],

    // 使用共享进程池中的子进程去处理任务
    threadPool: happyThreadPool,
  })
}

exports.extractCSS=()=>{
  return new MiniCssExtractPlugin({
    filename: "style/[name].[contenthash].css",
    chunkFilename: "style/[name].[contenthash].css"
  })
};

exports.html=()=>{
  return new HtmlWebpackPlugin({
    title:'webpack4 demo',
    filename:'index.html',
    template:path.join(rootPath,'./index.ejs'),
    inject: 'false', //inject: true | 'head' | 'body' | false  ,注入所有的资源到特定的 template 或者 templateContent 中，如果设置为 true 或者 body，所有的 javascript 资源将被放置到 body 元素的底部，'head' 将放置到 head 元素中。
    /* minify: isDev ? null : {
      removeComments: true,//移除HTML中的注释
      collapseWhitespace: true,//删除空白符与换行符
      removeRedundantAttributes: true,
      useShortDoctype: true,
      removeEmptyAttributes: true,
      removeStyleLinkTypeAttributes: true,
      keepClosingSlash: true,
      minifyJS: true,
      minifyCSS: true,
      minifyURLs: true,
    } */
  })
};

exports.CopyFavicon=()=>new CopyWebpackPlugin([{from: 'favicon.ico'}])


exports.define=()=>{
  return new webpack.DefinePlugin({
    'process.env.NODE_ENV':JSON.stringify(process.env.NODE_ENV||'development'),
    'process.env.NODE_BUILD':JSON.stringify(process.env.NODE_BUILD || 'client'),
  })
}

// 优化控制台输出
exports.friendlyErrors = () => {
  var localIP = internalIp.v4();

  return new FriendlyErrorsWebpackPlugin({
    compilationSuccessInfo: {
      messages: [
        `Local    ->  http://localhost:5000/`,
        `Network  ->  http://${localIP}:5000/`
      ]
    }
  });
};

/*************************dev******************************************/
exports.hrm=()=>{
  return new webpack.HotModuleReplacementPlugin()
}

/*************************prod******************************************/
exports.preloadPlugin1=()=>{
  return new PreloadPlugin({rel: 'preload',include: ['vendors','main']})
}
exports.preloadPlugin2=()=>{
  return new PreloadPlugin({rel: 'prefetch',include: 'asyncChunks',})
}


// 模块依赖分析
exports.analyzer=()=>{
  return new BundleAnalyzerPlugin()
};

exports.clean=()=>{
  return new CleanWebpackPlugin(['./dist'],{root: rootPath,})
};
// 优化css打包，避免重复打包
exports.optimizeCSS=()=>{
  return new OptimizeCSSAssetsPlugin({
    assetNameRegExp: /\.css$/g,
    cssProcessor: require('cssnano'),
    cssProcessorOptions: {
      safe: true,
      autoprefixer: { disable: true },
      mergeLonghand: false,
      discardComments: {
        removeAll: true
      }
    },
    canPrint: true
  })
};
//代码压缩插件
exports.uglify=()=>{
  return new WebpackParallelUglifyPlugin({
    cacheDir: path.join(__dirname,'../.cache'),
    uglifyJS: {
      output: {
        beautify: false, //不需要格式化
        comments: false //不保留注释
      },
      compress: {
        warnings: false, // 在UglifyJs删除没有用到的代码时不输出警告
        drop_console: true, // 删除所有的 `console` 语句，可以兼容ie浏览器
        collapse_vars: true, // 内嵌定义了但是只用到一次的变量
        reduce_vars: true // 提取出出现多次但是没有定义成变量去引用的静态值
      }
    }
  })
};
/* exports.uglify=()=>new UglifyJsPlugin({
  cache: true,
  parallel: true,
  
}) */
// 将manifest内联到html中，避免多发一次请求
exports.inlineManifest = () => {
  return new InlineManifestWebpackPlugin();
};
//去掉没有用到的css，打包之后很小，只打包了用到的样式,这个很厉害
exports.purifyCss=()=>{
  return new purifyCssPlugin({
    paths: glob.sync(path.join(__dirname, '/src/*/*.js'||'/src/*/*.jsx')),
    moduleExtensions:['.js','.jsx'],
    purifyOptions:{
      info:true,
      minify:true,
    }
  })
}

exports.loadable=()=>{
  return new ReactLoadablePlugin({
    filename: path.join(__dirname,'../dist/react-loadable.json'),
  })
}

exports.NamedModulesPlugin=()=>{
  return new webpack.NamedModulesPlugin()
}

exports.NamedChunksPlugin=()=>{
  const seen = new Set()
  const nameLength = 4
  return new webpack.NamedChunksPlugin(chunk => {
    if (chunk.name) {
      return chunk.name
    }
    const modules = Array.from(chunk.modulesIterable)
    if (modules.length > 1) {
      const hash = require('hash-sum')
      const joinedHash = hash(modules.map(m => m.id).join('_'))
      let len = nameLength
      while (seen.has(joinedHash.substr(0, len))) len++
      seen.add(joinedHash.substr(0, len))
      return `chunk-${joinedHash.substr(0, len)}`
    } else {
      return modules[0].id
    }
  })
}
