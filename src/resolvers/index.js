import userResolvers from './user'
import groupResolvers from './group'
import hangoutResolvers from './hangout'
import { resolvers } from 'graphql-scalars'

const customResolverMap = { ...resolvers }

export default [customResolverMap, userResolvers, groupResolvers, hangoutResolvers]
