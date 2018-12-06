import {User, UserFollow} from "../db/model";
import jwt from 'jsonwebtoken';
import md5 from 'md5';
import {getList,pageList} from '../util.js';

let user=`
  username: String
  role: [String]
  avatar: String
  age: String
  userphone: String!
`
export let typeDefs=`
  input UserInput {
    ${user}
    password: String
  }
  type User {
    ${user}
    _id: String
    followers: Int
    followings: Int
    postCount: Int
    likes: Int
  }
  type Users {
    ${pageList}
    list: [User]
  }
  extend type Query{
    login(input: UserInput): String
    getUser(username: String,userId: String): User
    getAllUsers(pageNo: Int,pageSize: Int,sort: String): Users
  }
  extend type Mutation{
    register(input: UserInput): String
    following(userId: String): String
  }
`

export let resolvers={
  Query:{
    async login(_,{input},ctx){
      if((input.username || input.userphone) && input.password) {

        let userInfo = await User.findOne({username: input.username}).select({username: 1, password: 1}).exec();
        if (userInfo) {
          let veryPwd = md5(input.password) === userInfo.password;
          if (veryPwd) {
            let token = jwt.sign({username: input.username}, 'secret', {expiresIn: '7 days'});
            ctx.cookies.set('token', token);
            return '登录成功'
          } else {
            throw('密码输入错误，请重新输入!')
          }
        } else {
          throw('用户不存在，请重新登录！')
        }
      }else{
        return '用户名或手机号码和密码必填!'
      }
    },
    async getUser(_,{userId,username},ctx){
      if(!ctx.user)throw('未登录的用户');

      if(userId || username){
        let userInfo=await User.findOne({$or:[{username:eval(`/${username}/`)},{_id: userId}]});
        return (userInfo)
      }else{
        throw('username和userId必填一个')
      }
    },
    async getAllUsers(_,{pageNo,pageSize,sort},ctx){
      if(!ctx.user)throw('未登录的用户')
      let userList= await getList({Model: User, pageNo,pageSize ,sort})
      return userList
    },
  },
  Mutation:{
    async register(_,{input},ctx){
      if(!input.username || !input.password || !input.userphone){
        throw('用户名和密码必填!')
      }
      let isExitUser=await User.findOne({userphone:input.userphone})
      if(isExitUser)return (`用户名【${input.username}】已存在！`);
      try{
        input.password=md5(input.password);
        input.role=['普通用户'];
        await User(input).save();
        return `新建用户【${input.username}】成功！`
      }catch(e){
        throw(`注册服务出错!`)
      }
    },
    async following(_,{userId},ctx){
      if(!ctx.user)throw('未登录的用户');
      if(userId===ctx.user['_id'])return '不能关注自己';
      let isExit=await UserFollow.findOne({followers:userId,followings:ctx.user['_id']})
      if(isExit){
        await User.update({_id:ctx.user['id']},{$inc:{followers:-1}})
        await User.update({_id: userId},{$inc: {followings:-1}})
        await UserFollow({followers: userId, followings: ctx.user['_id']}).save();
        return `取消关注`
      }else{
        await User.update({_id:ctx.user['id']},{$inc:{followers:1}});
        await User.update({_id: userId},{$inc: {followings:1}});
        await UserFollow.remove({followers: userId, followings: ctx.user['_id']});
        return `关注`
      }
    }
  }
}

