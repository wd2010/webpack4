const fs = require('fs');
const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const isDev=process.env.NODE_ENV==='development'
const rootPath=path.join(__dirname,'../');

let styleLoader = {
  loader: 'style-loader',
  options: {
    sourceMap: isDev,
  }
};

let cssloader={
  loader: 'css-loader',//解释(interpret) @import 和 url() ，会 import/require() 后再解析(resolve)它们
  options: {
    sourceMap:isDev,
    importLoaders:2,//用于配置「css-loader 作用于 @import 的资源之前」有多少个 loader, 0 => 无 loader(默认); 1 => postcss-loader; 2 => postcss-loader, sass-loader
  }
};

let postloader={
  loader:'postcss-loader',
  options: {
    plugins:()=>[require("autoprefixer")({browsers:'last 5 versions'})],
    sourceMap:isDev,
  }
};

let sassloader={
  loader:'sass-loader',
    options:{
      sourceMap:isDev,
    }
};

exports.css=()=>({
  test:/\.(css|scss)$/,
  exclude:/node_modules/,
  include: path.resolve(rootPath, "src"),
  use: [
    isDev? styleLoader: MiniCssExtractPlugin.loader,
    cssloader,
    postloader,
    sassloader,
  ],
});

exports.babel=()=>({
  test: /.jsx?$/,
  exclude: /node_modules/,
  include: path.join(rootPath,'src'),
  use: ['happypack/loader?id=babel']
});

exports.images=()=>({
  test: /\.(png|jpe?g|gif|svg|webp)(\?.*)?$/,
  exclude:/node_modules/,
  use: [
    {
      loader: 'url-loader',
      options: {
        limit: 1024,
        name: 'img/[sha512:hash:base64:7].[ext]'
      },
    },
    // 生产模式启用图片压缩
    !isDev && {
      loader: 'imagemin-loader',
      options: {
        plugins: [
          {
            use: 'imagemin-pngquant',
            options: {
              quality: '50-60'
            },
          },
          {
            use: 'imagemin-mozjpeg'
          },
        ]
      }
    }
  ].filter(p=>p),
});

exports.fonts=()=>({
  test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
  loader: 'url-loader',
  options: {
    limit: 1024,
    name: 'fonts/[name].[hash:8].[ext]'
  }
});

exports.medias=()=>({
  test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
  loader: 'url-loader',
  options: {
    limit: 3000,
    name: 'medias/[name].[hash:8].[ext]'
  }
});