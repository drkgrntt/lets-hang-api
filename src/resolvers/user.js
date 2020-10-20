import jwt from 'jsonwebtoken'
import { AuthenticationError } from 'apollo-server'


const generateToken = user => {

  const expirationLength = 1000 * 60 * 60 * 24 * 30

  const token = jwt.sign({
    iat: new Date().getTime() / 1000,
    exp: new Date().getTime() + expirationLength / 1000,
    uid: user._id
  }, process.env.JWT_SECRET)

  return token
}


const createUser = async (parent, args, { User, Group }) => {

  const { email, firstName, lastName, password } = args

  const newUser = new User({
    username: email,
    email,
    firstName,
    lastName,
    groups: [],
    memberOf: [],
    hangouts: [],
    attending: []
  })

  // Default group
  const group = new Group({
    title: 'Friends',
    description: 'Your main list of friends',
    owner: newUser
  })

  group.save()
  newUser.groups.push(group)

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


const searchUsers = async (parent, { search }, { User }) => {
  try {
    return await User.find({ email: new RegExp(search, 'i') })
      .lean().populate('hangouts').populate('groups')
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


const checkEmail = async (parent, { email }, { User }) => {
  return !!await User.findOne({ email }).lean()
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


const fetchMemberOf = ({ memberOf }, args, { Group }) => {

  if (memberOf.length > 0 && memberOf[0].title) {
    return memberOf
  }

  return memberOf.map(async _id => {
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


const fetchInvitedTo = ({ invitedTo }, args, { Hangout }) => {

  if (invitedTo.length > 0 && invitedTo[0].title) {
    return invitedTo
  }

  return invitedTo.map(async _id => {
    return await Hangout.findOne({ _id })
      .lean().populate('organizer')
      .populate('invited').populate('attendees')
  })
}


const fetchAttending = ({ attending }, args, { Hangout }) => {

  if (attending.length > 0 && attending[0].title) {
    return attending
  }

  return attending.map(async _id => {
    return await Hangout.findOne({ _id })
      .lean().populate('organizer')
      .populate('invited').populate('attendees')
  })
}


export default {
  Query: {
    user: fetchUser,
    users: searchUsers,
    currentUser: fetchCurrentUser,
    checkEmail
  },

  Mutation: {
    createUser,
    loginUser
  },

  User: {
    groups: fetchUserGroups,
    memberOf: fetchMemberOf,
    hangouts: fetchUserHangouts,
    invitedTo: fetchInvitedTo,
    attending: fetchAttending
  }
}