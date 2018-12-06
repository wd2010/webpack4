import Router from 'koa-router';
import graphqlHTTP from 'koa-graphql';
import { makeExecutableSchema } from 'graphql-tools';
import * as post from './post.js';
import * as user from './user.js';
import * as comment from './comment.js'
const router = new Router()

const typeDefs=`
  type Query {
    hello : String
  }
  type Mutation {
    hello : String
  }
  schema {
    query: Query
    mutation: Mutation
  }
`

const executableSchema = makeExecutableSchema({
  typeDefs: [typeDefs,post.typeDefs, user.typeDefs,comment.typeDefs],
  resolvers: [post.resolvers, user.resolvers, comment.resolvers],
});

// const executableSchema=(arrs)=>{
//   return makeExecutableSchema({
//     typeDefs: arrs.map(item=>item.typeDefs).push(typeDefs),
//     resolvers: arrs.map(item=>item.resolvers)
//   })
// }

router.all('/graphql',graphqlHTTP({
  schema: executableSchema/*([post,user,comment])*/,
  graphiql: true,
}))

export default router