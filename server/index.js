require('./ignore.js')();
require('babel-polyfill');
require('babel-register')({
  presets: ['env', 'react', 'stage-0'],
  plugins: ["react-loadable/babel",'syntax-dynamic-import',"dynamic-import-node"]
});


const app=require('./app.js').default,
  graphqlRouter=require('./graph/index.js').default,
  clientRouter=require('./clientRouter.js').default,
  veryUser=require('./middleware/user.js').veryUser,

  staticCache  = require("koa-static-cache"),
  path =require('path'),
  cors=require('koa2-cors'),
  portfinder=require('portfinder'),
  Loadable=require('react-loadable');

let port =process.env.port;

(async ()=>{
  port = port? port : portfinder.getPortPromise({port: 8000,stopPort: 8333})
})();
const port=portfinder.getPort();

app.use(cors());
app.use(staticCache (path.resolve(__dirname,'../dist'),{
  maxAge: 365 * 24 * 60 * 60,
  gzip:true
}));
app.use(veryUser)
app.use(graphqlRouter.routes()).use(graphqlRouter.allowedMethods());
app.use(clientRouter);


console.log(`\n==> 🌎  Listening on port ${port}. Open up http://172.0.0.1:${port}/ in your browser.\n`)
Loadable.preloadAll().then(() => {
  app.listen(port)
})


