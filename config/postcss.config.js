var path = require('path');

module.exports = {
  plugins: [
    require('postcss-import')({
      path: path.resolve('node_modules')
    }),
    require('postcss-mixins')(),
    require('postcss-advanced-variables')(),
    require('postcss-color-function')(),
    require('postcss-nested')(),
    require('postcss-extend')(),
    require('postcss-calc')({
      mediaQueries: true,
      selectors: false
    }),
    require('postcss-plugin-px2rem')({
      rootValue: {
        rpx: 50
      }
    }),
    require('autoprefixer')({
      browsers: [
        'last 4 versions',
        'ie >= 9',
        'iOS >= 7',
        'Android >= 4'
      ]
    })
  ]
};
