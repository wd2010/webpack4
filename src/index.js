import React from 'react';
import {render} from 'react-dom';
import App from './components/App'

render(<App />, document.getElementById('root'));

if(process.env.NODE_ENV==='development'){
  if(module.hot){
    module.hot.accept('./components/App.jsx',async ()=>{
      let {default: Comp}= await import('./components/App.jsx');
      render(<Comp />, document.getElementById('root'));
    });
  }
}