import jwt from 'jsonwebtoken';
import {User} from '../db/model.js';

export const veryUser=async(ctx,next)=>{
  let token=ctx.cookies.get('token');
  if(token){
    let verify=jwt.verify(token,'secret');
    ctx.user=await User.findOne({username: verify.username})
  }
  await next()
}