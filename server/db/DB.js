import {User, Post, Comment} from './model.js';

const getModel=(coll)=>{
  switch(coll){
    case 'User':
      return User;
    case 'Post':
      return Post;
    case 'Comment':
      return Comment;
  }
}
Model.find({},'User').limit().exec()
export const insert=async(obj,coll)=>{
  let Model=getModel(coll);
  let entity=new Model(obj)
  return await new Promise(resolve=> {
    entity.save((err, res) => {
      if (err) throw err;
      resolve(res)
    })
  })
}

export const find=async(wherestr={},option={},coll)=>{
  let Model=getModel(coll);
  return await new Promise(resolve=>{
    Model.find(wherestr,option,(err,res)=>{
      if(err)throw err
      resolve(res)
    })
  })
}

export const findOne=async (wherestr={},coll)=>{
  let Model=getModel(coll);
  return await new Promise(resolve=>{
    Model.findOne(wherestr,(err,res)=>{
      if(err)throw err
      resolve(res)
    })
  })
}
