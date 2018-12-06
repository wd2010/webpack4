import {GraphQLNonNull}  from 'graphql';

export const NonNullType=(data)=>({type: new GraphQLNonNull(data.type)});
export const getModel=(coll)=>{
  switch(coll){
    case 'User':
      return User;
    case 'Post':
      return Post;
    case 'Comment':
      return Comment;
  }
}

export const pageList=`
    listSize: Int
    totalSize: Int
    pageNo: Int
    pageSize: Int
  `

export const getList=async ({pageNo=1,pageSize=10,query={},Model ,sort='_id',ref='',ref_detail=''})=>{
  let cursor=Model.find(query)
  let totalSize=(await cursor).length;
  let list=await cursor.skip((pageNo*1-1)*pageSize).limit(pageSize*1).sort({[sort]:1}).populate(ref,ref_detail)
  return {totalSize, listSize: list.length ,list,pageNo,pageSize}
}