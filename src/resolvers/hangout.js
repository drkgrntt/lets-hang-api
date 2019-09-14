import { ForbiddenError } from 'apollo-server'
import { combineResolvers } from 'graphql-resolvers'
import { isAuthenticated } from './authorization'

const fetchHangout = async (parent, args, { Hangout }) => {
  return await Hangout.findOne({ _id: args.id })
    .lean()
    .populate('organizer')
    .populate('attendees')
    .populate('invited')
}

const fetchHangouts = async (parent, args, { Hangout }) => {
  return await Hangout.find()
    .lean()
    .populate('organizer')
    .populate('attendees')
    .populate('invited')
}

const createHangout = async (parent, args, { Hangout, me }) => {

  const {
    title,
    description,
    datetime,
    location,
    attendeeLimit
  } = args

  const hangout = new Hangout({
    title,
    description,
    datetime,
    location,
    attendeeLimit,
    organizer: me,
    invited: [],
    attendees: []
  })

  await hangout.save()

  me.hangouts.push(hangout)
  await me.save()

  return await Hangout.findOne({ _id: hangout._id })
    .lean()
    .populate('organizer')
    .populate('attendees')
    .populate('invited')
}

const deleteHangout = async (parent, { id }, { Hangout, me }) => {

  const hangout = await Hangout.findOne({ _id: id })
    .lean()
    .populate('organizer')

  if (!me._id.equals(hangout.organizer._id)) {
    throw new ForbiddenError('Only the organizer can delete a hangout.')
  }

  return Hangout.findOneAndRemove({ _id: id })
}

const joinHangout = async (parent, { id }, { me, Hangout }) => {

  const hangout = await Hangout.findOne({ _id: id })

  switch (true) {
    case hangout.organizer._id.equals(me._id):
      throw new ForbiddenError('You are already the organizer for this hangout.')

    case !hangout.invited.includes(me._id):
      throw new ForbiddenError('You were not invited to this hangout.')

    case hangout.attendees.includes(me._id):
      throw new ForbiddenError('You are already attending this hangout.')

    default:
      me.hangouts.push(hangout)
      await me.save()
      hangout.attendees.push(me)
      return await hangout.save()
  }
}

const inviteUser = async (parent, { userId, hangoutId }, { Hangout, User, me }) => {

  const hangout = await Hangout.findOne({ _id: hangoutId })
  const user = await User.findOne({ _id: userId })

  switch (true) {
    case !hangout.organizer._id.equals(me._id):
      throw new ForbiddenError('You can only invite people to hangouts you have organized.')

    case user._id.equals(me._id):
      throw new ForbiddenError('You already own this hangout.')

    case hangout.invited.filter(invitedUser => invitedUser._id.equals(user._id)).length > 0:
      throw new ForbiddenError('The user is already invited to the hangout.')

    default:
      hangout.invited.push(user)
      return await hangout.save()
  }
}

const fetchOrganizer = async ({ organizer }, args, { User }) => {

  if (organizer.email) {
    return organizer
  }

  return await User.findOne({ _id: organizer })
    .lean().populate('groups').populate('hangouts')
}

const fetchInvited = ({ invited }, args, { User }) => {

  if (invited.length > 0 && invited[0].email) {
    return invited
  }

  return invited.map(async _id => {
    return await User.findOne({ _id })
      .lean().populate('hangouts').populate('groups')
  })
}

const fetchAttendees = ({ attendees }, args, { User }) => {

  if (attendees.length > 0 && attendees[0].email) {
    return attendees
  }

  return attendees.map(async _id => {
    return await User.findOne({ _id })
      .lean().populate('hangouts').populate('groups')
  })
}

export default {
  Query: {
    hangout: combineResolvers(isAuthenticated, fetchHangout),
    hangouts: combineResolvers(isAuthenticated, fetchHangouts)
  },

  Mutation: {
    createHangout: combineResolvers(isAuthenticated, createHangout),
    deleteHangout: combineResolvers(isAuthenticated, deleteHangout),
    joinHangout: combineResolvers(isAuthenticated, joinHangout),
    inviteUser: combineResolvers(isAuthenticated, inviteUser)
  },

  Hangout: {
    organizer: fetchOrganizer,
    invited: fetchInvited,
    attendees: fetchAttendees
  }
}