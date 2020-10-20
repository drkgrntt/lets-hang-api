import { ForbiddenError } from 'apollo-server'
import { combineResolvers, skip } from 'graphql-resolvers'

// Is the user authenticated?
export const isAuthenticated = (parent, args, { me }) => {
  return me ? skip : new ForbiddenError('Not authenticated as user.')
}

// Does the user own the group?
export const ownsGroup = combineResolvers(
  isAuthenticated,
  async (parent, { groupId }, { me, Group }) => {
    const group = await Group.findOne({ _id: groupId }).lean()
    if (!group) {
      return new ForbiddenError('This group does not exist.')
    }
    return group.owner._id.equals(me._id) ? skip : new ForbiddenError('You do not own this group.')
  }
)

// Did the user origanize the hangout?
export const organizedHangout = combineResolvers(
  isAuthenticated,
  async (parent, { hangoutId }, { me, Hangout }) => {
    const hangout = await Hangout.findOne({ _id: hangoutId }).lean()
    if (!hangout) {
      return new ForbiddenError('This hangout does not exist.')
    }
    return hangout.organizer._id.equals(me._id) ? skip : new ForbiddenError('You did not organize this hangout.')
  }
)
