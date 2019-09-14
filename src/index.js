import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import cookieSession from 'cookie-session'
import LocalStrategy from 'passport-local'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import { ApolloServer } from 'apollo-server-express'

import typeDefs from './schema'
import resolvers from './resolvers'
import models from './models'

const app = express()

app.use(cors())
app.use(cookieSession({
  maxAge: 30 * 24 * 60 * 60 * 1000,
  keys: [process.env.COOKIE_KEY]
}))
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(models.User.authenticate()))
passport.serializeUser(models.User.serializeUser())
passport.deserializeUser(models.User.deserializeUser())

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
  typeDefs,
  resolvers,
  context
})

server.applyMiddleware({ app, path: '/graph'})

app.listen({ port: process.env.PORT }, () => {
  console.log(`Apollo Server on http://localhost:${process.env.PORT}/graph`)
})