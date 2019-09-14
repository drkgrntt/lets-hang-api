import jwt from 'jsonwebtoken'
import { AuthenticationError, ForbiddenError } from 'apollo-server'
import { combineResolvers } from 'graphql-resolvers'
import { isAuthenticated } from './authorization'


const generateToken = user => {

  const expirationLength = 1000 * 60 * 60 * 24 * 30

  const token = jwt.sign({
    iat: new Date().getTime(),
    exp: new Date().getTime() + expirationLength,
    uid: user._id
  }, process.env.JWT_SECRET)

  return token
}

const createUser = async (parent, args, { User }) => {

  const { email, firstName, lastName, password } = args

  const newUser = new User({
    username: email,
    email,
    firstName,
    lastName,
    groups: [],
    hangouts: []
  })

  try {
    const user = await User.register(newUser, password)
    return { token: generateToken(user) }
  } catch (exception) {
    throw new AuthenticationError(exception)
  }
}

const loginUser = async (parent, { email, password }, { User }) => {

  try {

    const user = await User.findOne({ email })
    if (!user) {
      throw new AuthenticationError('No user was found with that email.')
    }

    const auth = await user.authenticate(password)
    if (auth.user) {
      return { token: generateToken(auth.user) }
    } else {
      throw new AuthenticationError(auth.error)
    }

  } catch(exception) {
    throw new AuthenticationError(exception)
  }
}

const fetchUser = async (parent, { id }, { User }) => {
  try {
    return await User.findOne({ _id: id }).lean().populate('hangouts').populate('groups')
  } catch (exception) {
    throw new AuthenticationError(exception)
  }
}

const fetchUsers = async (parent, args, { User }) => {
  try {
    return await User.find().lean().populate('hangouts').populate('groups')
  } catch (exception) {
    throw new AuthenticationError(exception)
  }
}

const fetchCurrentUser = (parent, args, { me }) => {
  try {
    return me
  } catch (exception) {
    throw new AuthenticationError(exception)
  }
}

const fetchUserGroups = ({ groups }, args, { Group }) => {

  if (groups.length > 0 && groups[0].title) {
    return groups
  }

  return groups.map(async _id => {
    return await Group.findOne({ _id })
      .lean().populate('members').populate('owner')
  })
}

const fetchUserHangouts = ({ hangouts }, args, { Hangout }) => {

  if (hangouts.length > 0 && hangouts[0].title) {
    return hangouts
  }

  return hangouts.map(async _id => {
    return await Hangout.findOne({ _id })
      .lean().populate('organizer')
      .populate('invited').populate('attendees')
  })
}


export default {
  Query: {
    user: fetchUser,
    users: fetchUsers,
    currentUser: combineResolvers(isAuthenticated, fetchCurrentUser)
  },

  Mutation: {
    createUser,
    loginUser
  },

  User: {
    groups: fetchUserGroups,
    hangouts: fetchUserHangouts
  }
}