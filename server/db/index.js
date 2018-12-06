import mongoose from 'mongoose';
let url='mongodb://127.0.0.1:27017/graphql';


mongoose.connect(url);
mongoose.connection.on('connected',()=>{
  console.log('Mongoose connection open to ' + url);
})
mongoose.connection.on('error',err=>{
  console.log('Mongoose connection error: ' + err);
})
mongoose.connection.on('disconnected',()=>{
  console.log('Mongoose connection disconnected');
})

export default mongoose