import mongoose from './index.js';
const Schema=mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const UserSchema=new Schema({
  userphone: {type: String,index: true},
  username: {type: String,index: true},
  password: {type: String},
  role: [String],
  avatar: {type: String, default: '默认头像'},
  followers: {type: Number, default: 0,},//自己关注了多少人
  followings: {type: Number, default: 0,},//自己被多少人关注了
  likes: {type: Number,default: 0},//收藏
  age: {type: String},
  postCount: {type: Number,default:0,},
}, { collection: 'User' ,})

const PostSchema=new Schema({
  title: {type: String, index: true},
  content: {type: String, index: true},
  created_at: {type: Date,default: Date.now},
  updated_at: {type: Date,default: Date.now},
  views: {type: Number,default: 0},
  likes: {type: Number,default: 0},
  author: {type:  ObjectId,ref: 'User'},
  tags: [{type:String}],
  comments: {type: Number,default: 0},
}, { collection: 'Post' })

const CommentSchema=new Schema({
  content: {type: String},
  created_at: {type: Date,default: Date.now},
  author: {type:  ObjectId,ref: 'User'},
  reply: {type:  ObjectId,ref: 'User'},
  post: {type:  ObjectId,ref: 'Post'},
},{collection:'Comment'})

const TagSchema=new Schema({
  tag: {type: String, index: true},
  post: {type:  ObjectId,ref: 'Post'},
},{collection:'Tag'})

const UserPostSchema=new Schema({
  user: {type: ObjectId, index: true, ref: 'User'},
  post: {type: ObjectId, index: true, ref: 'Post'}
},{collection: 'UserPostRelation'})

const UserFollowSchema=new Schema({
  followers: {type: ObjectId, index: true, ref: 'User'},//关注者
  followings: {type: ObjectId, index: true, ref: 'User'},//被关注者
},{collection: 'UserFollow'})

const PostTagSchema=new Schema({
  tag: {type: ObjectId, index: true, ref: 'Tag'},
  post: {type: ObjectId, index: true, ref: 'Post'}
},{collection:'PostTagRelation'})

export const User=mongoose.model('User',UserSchema)
export const Post=mongoose.model('Post',PostSchema)
export const Comment=mongoose.model('Comment',CommentSchema)
export const UserPostRelation=mongoose.model('UserPostRelation',UserPostSchema)
export const UserFollow=mongoose.model('UserFollow',UserFollowSchema)
export const Tag=mongoose.model('Tag',TagSchema)
export const PostTagRelation=mongoose.model('PostTagRelation',PostTagSchema)

