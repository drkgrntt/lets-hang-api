import { ForbiddenError } from 'apollo-server'
import { combineResolvers } from 'graphql-resolvers'
import { isAuthenticated } from './authorization'


const fetchGroup = async (parent, { id }, { Group }) => {
  return await Group.findOne({ _id: id }).lean().populate('members').populate('owner')
}

const fetchGroups = async (parent, args, { Group }) => {
  return await Group.find().lean().populate('members').populate('owner')
}

const createGroup = async (parent, { title, description }, { Group, me }) => {

  const group = new Group({
    title,
    description,
    owner: me
  })

  me.groups.push(group)
  await me.save()

  return await group.save()
}

const deleteGroup = async (parent, { id }, { Group, me }) => {

  const group = await Group.findOne({ _id: id }).lean()

  switch (true) {
    case !group:
      throw new ForbiddenError('This group does not exist.')
    case !group.owner._id.equals(me._id):
      throw new ForbiddenError('You can only delete your own group.')
    default:
      return await Group.findOneAndRemove({ _id: id })
  }
}

const addMember = async (parent, { userId, groupId }, { Group, User, me }) => {

  const group = await Group.findOne({ _id: groupId })
  const user = await User.findOne({ _id: userId })

  switch (true) {
    case !group.owner._id.equals(me._id):
      throw new ForbiddenError('You can only add members to groups you own.')

    case user._id.equals(me._id):
      throw new ForbiddenError('You already own this group.')

    case group.members.filter(member => member._id.equals(user._id)).length > 0:
      throw new ForbiddenError('The user is already a member of the group.')

    default:
      group.members.push(user)
      return await group.save()
  }
}

const fetchGroupMembers = ({ members }, args, { User }) => {
  if (members.length > 0 && members[0].email) {
    return members
  }

  return members.map(async _id => {
    return await User.findOne({ _id })
      .lean().populate('hangouts').populate('groups')
  })
}

const fetchOwner = async ({ owner }, args, { User }) => {
  if (owner.email) {
    return owner
  }

  return await User.findOne({ _id: owner._id })
    .lean().populate('hangouts').populate('groups')
}

export default {
  Query: {
    group: combineResolvers(isAuthenticated, fetchGroup),
    groups: combineResolvers(isAuthenticated, fetchGroups)
  },

  Mutation: {
    createGroup: combineResolvers(isAuthenticated, createGroup),
    deleteGroup: combineResolvers(isAuthenticated, deleteGroup),
    addMember: combineResolvers(isAuthenticated, addMember)
  },

  Group: {
    members: fetchGroupMembers,
    owner: fetchOwner
  }
}