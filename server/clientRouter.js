import React from 'react';
import {Provider} from 'react-redux';
import {renderToString} from 'react-dom/server';
//import {createMemoryHistory} from 'history'
import createMemoryHistory from 'history/createMemoryHistory'
import { getBundles } from 'react-loadable/webpack';
import stats from '../dist/react-loadable.json';
import Helmet from 'react-helmet';
import {matchPath} from 'react-router-dom';
import { matchRoutes } from 'react-router-config';
import path from 'path';
import fs from 'fs'
import Loadable from 'react-loadable';
import configureStore from '../src/store/configureStore';
import routesThunk from '../src/store/routesThunk';
import Routers from '../src/router';
import rootReducer from '../src/store/reducers'
import  {ConnectedRouter}  from 'react-router-redux';
//提取material-ui样式
import { SheetsRegistry } from 'react-jss/lib/jss';
import JssProvider from 'react-jss/lib/JssProvider';
import { create } from 'jss';
import preset from 'jss-preset-default';
import createGenerateClassName from '@material-ui/core/styles/createGenerateClassName';
//提取styled-componnets样式
import { ServerStyleSheet, StyleSheetManager } from 'styled-components'

const createTags=(modules)=>{
  let bundles = getBundles(stats, modules);
  let scriptfiles = bundles.filter(bundle => bundle.file.endsWith('.js'));
  let stylefiles = bundles.filter(bundle => bundle.file.endsWith('.css'));

  let scripts=scriptfiles.map(script=>`<script src="/${script.file}"></script>`).join('\n');
  let styles=stylefiles.map(style=>`<link href="/${style.file}" rel="stylesheet"/>`).join('\n');
  return {scripts,styles}
}

const prepHTML=(data,{html,head,rootString,scripts,styles,initState,materialCss,styleTags})=>{
  data=data.replace('<html',`<html ${html}`);
  data=data.replace('</head>',`${head} \n ${styles}</head>`);
  data=data.replace('<div id="root"></div>',`<div id="root">${rootString}</div><style id="jss-server-side">${materialCss}</style>${styleTags}`);
  data=data.replace('<body>',`<body> \n <script>window.__INITIAL_STATE__ =${JSON.stringify(initState)}</script>`);
  data=data.replace('</body>',`${scripts}</body>`);
  return data;
}

const getMatch=(routesArray, url)=>{
  return routesArray.some(router=>matchPath(url,{
    path: router.path,
    exact: router.exact,
  }))
}

const makeup=(ctx,store,html)=>{
  let initState=store.getState();
  let history=createMemoryHistory({initialEntries:[ctx.req.url]});
  const jss = create(preset());
  const generateClassName = createGenerateClassName();
  const sheetsRegistry = new SheetsRegistry();
  const sheet = new ServerStyleSheet();

  let modules=[];
  let rootString= renderToString(
    <Loadable.Capture report={moduleName => modules.push(moduleName)}>
      <StyleSheetManager sheet={sheet.instance}>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <JssProvider registry={sheetsRegistry} jss={jss} generateClassName={generateClassName}>
              <Routers isServer={true} />
            </JssProvider>
          </ConnectedRouter>
        </Provider>
      </StyleSheetManager>
    </Loadable.Capture>
  );
  let materialCss=sheetsRegistry.toString();//Material-ui 基础样式
  const styleTags = sheet.getStyleTags();//styled-components 样式

  let {scripts,styles}=createTags(modules)

  const helmet=Helmet.renderStatic();
  let renderedHtml=prepHTML(html,{
    html:helmet.htmlAttributes.toString(),
    head:helmet.title.toString()+helmet.meta.toString()+helmet.link.toString(),
    rootString,
    scripts,
    styles,
    initState,
    materialCss,
    styleTags
  })
  return renderedHtml;
}


const clientRouter=async(ctx,next)=>{
  let html=fs.readFileSync(path.join(path.resolve(__dirname,'../dist'),'index.html'),'utf-8');
  let {store}=configureStore(rootReducer);


  let isMatch=getMatch(routesThunk,ctx.req.url);
  if(isMatch){
    console.log(ctx.req.url)
    let branch=matchRoutes(routesThunk,ctx.req.url);
    let promises = branch.map(({route,match})=>{
      return route.thunk?(route.thunk(store)):Promise.resolve(null)
    });
    await Promise.all(promises).catch(err=>console.log('err:---',err))
    let renderedHtml=await makeup(ctx,store,html);
    ctx.body=renderedHtml
  }
  await next()
}

export default clientRouter;

