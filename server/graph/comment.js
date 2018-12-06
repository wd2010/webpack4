import {User,Post,Comment} from "../db/model";
import md5 from 'md5';
import {pageList, getList} from '../util.js';

let comment=`
  content: String
  created_at: String
  author: User
  reply: User
  postId: String
`
export let typeDefs =`
  type Comment{
    ${comment}
  }
  type Comments{
    ${pageList}
    list:[Comment]
  }
  extend type Query{
    getComments(postId: String!, pageNo: Int,pageSize: Int): Comments
  }
  extend type Mutation{
    remark(postId: String,replyId: String,content: String): String
  }
`

export let resolvers={
  Query:{
    async getComments(_,{postId,pageNo,pageSize},ctx){
      if(!ctx.user)throw('未登录的用户');
      let obj={post:postId}
      let res=await getList({pageNo,pageSize,query:obj,Model: Comment ,ref:'author reply'})
      console.log(res)
      return res
    }
  },
  Mutation:{
    async remark(_,input,ctx){
      if(!ctx.user)throw('未登录的用户');
      if(input.replyId===ctx.user._id) throw('不能回复自己的评论！');
      try{
        input.author=ctx.user;
        input.created_at=new Date;
        input.reply=input.replyId;
        input.post=input.postId;
        await Comment(input).save();
        await Post.update({_id:input.postId},{$inc:{comments:1}})
        return '评论成功'
      }catch(e){
        throw('评论出错：',e)
      }
    }
  }
}
