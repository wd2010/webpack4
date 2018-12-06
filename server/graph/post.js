import {User,Post,Comment,Tag,UserPostRelation, PostTagRelation} from "../db/model";
import {getList,pageList} from '../util.js';
let tag=`
  type: String
  name: String
`
let post=`
  _id: String,
  title: String,
  content: String,
  created_at: String,
  updated_at: String,
  views: Int,
  likes: Int,
  
`

export let typeDefs =`
  type Post {
    ${post}
    author: User,
  }
  type Posts{
    ${pageList}
    list: [Post]
  }
  
  type Tag {
    ${tag}
  }
  input TagInput{
    ${tag}
  }
  input TagInputs{
    tags:[String]
  }
  
  type User_Post{
    user: User
    post: Post
  }
  type Likes {
    ${pageList}
    list: [User_Post]
  }
  input PostInput {
    ${post}
  }
  extend type Query{
    getPost(postId: String,title: String): Post
    getAllPosts(userId: String, title: String,content: String,pageNo: Int,pageSize: Int,sort: String): Posts
    getLikes(postId: String, userId: String, pageNo: Int, pageSize: Int): Likes
  }
  extend type Mutation{
    addPost(title: String!, content: String!, input: TagInputs): String
    deletePost(postId: String!): String
    modifyPost(postId: String! input: PostInput): String
    likePost(postId: String): String
  }
`

export let resolvers={
  Query:{
    async getPost(_,{postId,title,content}){
      try{
        let post=await Post.findOne({$or: [{_id:postId}, {title:eval(`/${title}/i`)}, {content: eval(`/${content}/`)}]}).populate('author','-password')
        return post
      }catch(e){
        throw('查询post出错')
      }
    },
    async getAllPosts(_,{userId,title,content,pageNo,pageSize,sort}){
      try{
        let queryTitle=eval(`/${title}/i`)
        let queryContent=eval(`/${content}/i`)
        let obj={};
        title && (obj.title=queryTitle);
        content && (obj.content=queryContent);
        userId && (obj.author=userId)
        let res=await getList({pageNo,pageSize,query:obj,Model: Post ,sort,ref:'author',ref_detail:'-password'})
        return res
      }catch(e){
        throw('查询posts list失败：',e)
      }
    },
    async getLikes(_,{postId,userId,pageNo,pageSize},ctx){
      let obj={$or:[{post: postId},{user: userId}]}
      let res=await getList({pageNo,pageSize,query:obj,Model: UserPostRelation ,ref:'user post',})
      return res
    }
  },
  Mutation:{
    async addPost(_,{title,content,input},ctx){
      let obj={title,content}
      if(!ctx.user)throw('未登录的用户');
      try{
        if(input || input.tags){
          obj.tags=input.tags
        }
        obj.author=ctx.user;
        let res=await Post(obj).save();
        if(res) {
          let tags=[]
          if(input.tags.length>0){
            let tagPromises=input.tags.map(tag=>(Tag({tag: tag ,post: res['_id'] }).save()))
            tags=await Promise.all(tagPromises)
            let tagPostPromises=tags.map(tag=>(PostTagRelation({post: tag.post,tag: tag['_id']}).save()))
            await Promise.all(tagPostPromises)
          }
          let username=ctx.user.username;
          await User.update({username},{$inc:{postCount:1}})
          return '插入帖子Success'
        }
      }catch(e){
        throw ('插入帖子出错！',e)
      }
    },
    async deletePost(_,{postId},ctx){
      if(!ctx.user)throw('未登录的用户');
      let res=await Post.remove({_id:postId})
      if(res.n){
        let username=ctx.user.username;
        await User.update({username},{$inc:{postCount:-1}})
        return `删除成功，删除了${res.n}条`
      }else{
        throw('删除帖子失败')
      }
    },
    async modifyPost(_,{postId,input:{title,content}},ctx){
      try{
        let obj={updated_at: new Date}
        title && (obj['title']=title);
        content && (obj['content']=content);
        await Post.update({_id:postId},{$set:obj})
      }catch(e){
        throw('修改帖子失败:',e)
      }
    },
    async likePost(_,{postId},ctx){
      if(!ctx.user)throw('未登录的用户');
      let query={user: ctx.user._id,post: postId}
      let isExit =await UserPostRelation.findOne(query);
      if(!isExit){
        await UserPostRelation(query).save();
        await Post.update({_id: postId},{$inc:{likes:1}})
        await User.update({_id: ctx.user._id},{$inc:{likes:1}})
        return '收藏'
      }else{
        await UserPostRelation.remove(query)
        await Post.update({_id: postId},{$inc:{likes:-1}});
        await User.update({_id: ctx.user._id},{$inc:{likes:1}});
        return '取消收藏'
      }
    }
  }
}
