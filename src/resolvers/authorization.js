import { ForbiddenError } from 'apollo-server'
import { skip } from 'graphql-resolvers'

export const isAuthenticated = async (parent, args, context) => {
  return context.me ? skip : new ForbiddenError('Not authenticated as user.')
}