import { ForbiddenError } from 'apollo-server'
import { combineResolvers } from 'graphql-resolvers'
import { isAuthenticated, organizedHangout } from './authorization'


// =================================== //
//           Query Functions           //
// =================================== //

const fetchHangout = async (parent, { hangoutId }, { Hangout }) => {
  return await Hangout.findOne({ _id: hangoutId })
    .lean()
    .populate('organizer')
    .populate('attendees')
    .populate('invited')
}


const fetchHangouts = async (parent, args, { Hangout, me }) => {
  return await Hangout.find({ organizer: me })
    .lean()
    .populate('organizer')
    .populate('attendees')
    .populate('invited')
}


// ================================== //
//         Mutation Functions         //
// ================================== //

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

  me.hangouts.push(hangout)
  await me.save()

  return await hangout.save()
}


const updateHangout = async (parent, args, { Hangout, me }) => {

  const {
    hangoutId,
    title,
    description,
    datetime,
    location,
    attendeeLimit
  } = args

  const hangout = await Hangout.findOne({ _id: hangoutId })

  if (!hangout) {
    throw new ForbiddenError('This hangout does not exist.')
  }

  const existingHangout = await Hangout.findOne({ title }).lean()
  if (existingHangout && !existingHangout._id.equals(hangout._id)) {
    throw new ForbiddenError('You already have a hangout with this title.')
  }

  hangout.title = title
  hangout.description = description
  hangout.datetime = datetime
  hangout.location = location
  hangout.attendeeLimit = attendeeLimit

  return await hangout.save()
}


const deleteHangout = async (parent, { hangoutId }, { Hangout, me }) => {

  const hangout = await Hangout.findOne({ _id: hangoutId }).populate('attendees').populate('invited')

  if (!hangout) {
    throw new ForbiddenError('This hangout does not exist.')
  }

  me.hangouts = me.hangouts.filter(myHangout => !myHangout._id.equals(hangout._id))
  me.save()

  for (const user of hangout.invited) {
    user.invitedTo = user.invitedTo.filter(userHangout => !userHangout.equals(hangout._id))
    user.save()
  }

  for (const user of hangout.attendees) {
    user.attending = user.attending.filter(userHangout => !userHangout.equals(hangout._id))
    user.save()
  }

  return Hangout.findOneAndRemove({ _id: hangoutId })
}


const joinHangout = async (parent, { hangoutId }, { me, Hangout }) => {

  const hangout = await Hangout.findOne({ _id: hangoutId })

  switch (true) {
    case hangout.organizer._id.equals(me._id):
      throw new ForbiddenError('You are already the organizer for this hangout.')

    case !hangout.invited.includes(me._id):
      throw new ForbiddenError('You were not invited to this hangout.')

    case hangout.attendees.includes(me._id):
      throw new ForbiddenError('You are already attending this hangout.')

    default:
      me.attending.push(hangout)
      await me.save()

      hangout.attendees.push(me)
      return await hangout.save()
  }
}


const leaveHangout = async (parent, { hangoutId }, { me, Hangout }) => {

  const hangout = await Hangout.findOne({ _id: hangoutId })

  switch (true) {
    case hangout.organizer._id.equals(me._id):
      throw new ForbiddenError('You are the organizer and cannot leave the hangout.')

    case !hangout.attendees.includes(me._id):
      throw new ForbiddenError('You are already not attending this hangout.')

    default:
      me.attending = me.attending.filter(myHangout => !myHangout.equals(hangout._id))
      await me.save()

      hangout.attendees = hangout.attendees.filter(attendee => !attendee.equals(me._id))
      return await hangout.save()
  }
}


const inviteUser = async (parent, { userId, hangoutId }, { Hangout, User, me }) => {

  const hangout = await Hangout.findOne({ _id: hangoutId })
  const user = await User.findOne({ _id: userId })

  switch (true) {
    case user._id.equals(me._id):
      throw new ForbiddenError('You already own this hangout.')

    case hangout.invited.filter(invitedUser => invitedUser.equals(user._id)).length > 0:
      throw new ForbiddenError('The user is already invited to the hangout.')

    default:
      user.invitedTo.push(hangout)
      await user.save()

      hangout.invited.push(user)
      return await hangout.save()
  }
}


const uninviteUser = async (parent, { userId, hangoutId }, { Hangout, User, me }) => {

  const hangout = await Hangout.findOne({ _id: hangoutId })
  const user = await User.findOne({ _id: userId })

  switch (true) {
    case user._id.equals(me._id):
      throw new ForbiddenError('You already own this hangout.')

    case hangout.invited.filter(invitedUser => invitedUser._id.equals(user._id)).length === 0:
      throw new ForbiddenError('The user is already not invited to the hangout.')

    default:
      if (user.attending.filter(userHangout => userHangout.equals(hangout._id)) > 0) {
        user.attending = user.attending.filter(userHangout => !userHangout.equals(hangout._id))
        await user.save()
      }

      hangout.invited = hangout.invited.filter(invited => !invited.equals(user._id))
      return await hangout.save()
  }
}


// =================================== //
//          Hangout Functions          //
// =================================== //

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


// =================================== //
//           Resolver Object           //
// =================================== //

export default {
  Query: {
    hangout: combineResolvers(organizedHangout, fetchHangout),
    hangouts: combineResolvers(isAuthenticated, fetchHangouts)
  },

  Mutation: {
    createHangout: combineResolvers(isAuthenticated, createHangout),
    updateHangout: combineResolvers(organizedHangout, updateHangout),
    deleteHangout: combineResolvers(organizedHangout, deleteHangout),

    joinHangout: combineResolvers(isAuthenticated, joinHangout),
    leaveHangout: combineResolvers(isAuthenticated, leaveHangout),

    inviteUser: combineResolvers(organizedHangout, inviteUser),
    uninviteUser: combineResolvers(organizedHangout, uninviteUser)
  },

  Hangout: {
    organizer: fetchOrganizer,
    invited: fetchInvited,
    attendees: fetchAttendees
  }
}