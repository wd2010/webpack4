const path = require('path')
const rootPath=path.join(__dirname,'../');
const loader = require('./loader.js');
const plugin = require('./plugin.js');

const baseConfig = {
  cache: true,
  context: path.join(rootPath, "./src"),
  entry: {
    main: "./index.js",
    Y: "./yy.js"
  },

  // watch: true,
  resolve: {
    extensions: [".js", ".jsx", ".css", ".less", ".scss", ".png", ".jpg"],
    modules: [path.join(rootPath, "src"), "node_modules"]
  },

  module: {
    rules: [
      loader.babel(),
      loader.css(),
      loader.images(),
      loader.fonts(),
      loader.medias()
    ]
  },


  plugins: [
    plugin.happyPackBabel(),
     
    plugin.CopyFavicon(),
    plugin.html(),
    plugin.define(),

    //plugin.preloadPlugin1(),
    //plugin.preloadPlugin2(),
  ]
};
module.exports=baseConfig