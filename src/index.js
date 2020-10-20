import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import LocalStrategy from 'passport-local'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import { ApolloServer } from 'apollo-server-express'

import typeDefs from './schema'
import resolvers from './resolvers'
import models from './models'

const app = express()

app.use(cors())
app.use(passport.initialize())
passport.use(new LocalStrategy(models.User.authenticate()))

const context = async ({ req }) => {

  const { token } = req.headers
  let me = null

  if (token) {
    const tokenData = jwt.verify(token, process.env.JWT_SECRET)
    if (tokenData) {
      me = await models.User.findOne({ _id: tokenData.uid }).populate('groups').populate('hangouts')
    }
  }

  return {
    ...models,
    me
  }
}

const server = new ApolloServer({
  introspection: true,
  playground: true,
  typeDefs,
  resolvers,
  context
})

server.applyMiddleware({ app, path: '/graph'})

app.listen({ port: process.env.PORT }, () => {
  console.log(`Apollo Server running on http://localhost:${process.env.PORT}/graph`)
})