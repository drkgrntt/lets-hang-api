import { ForbiddenError } from 'apollo-server'
import { combineResolvers } from 'graphql-resolvers'
import { isAuthenticated, ownsGroup } from './authorization'


// =================================== //
//           Query Functions           //
// =================================== //

const fetchGroup = async (parent, { groupId }, { Group }) => {
  return await Group.findOne({ _id: groupId }).lean().populate('members').populate('owner')
}


const fetchGroups = async (parent, args, { Group, me }) => {
  return await Group.find({ owner: me }).lean().populate('members').populate('owner')
}


// ================================== //
//         Mutation Functions         //
// ================================== //

const createGroup = async (parent, { title, description }, { Group, me }) => {

  const titleExists = await !!Group.findOne({ title }).lean()
  if (titleExists) {
    throw new ForbiddenError('You already have a group with this title.')
  }

  const group = new Group({
    title,
    description,
    owner: me
  })

  me.groups.push(group)
  await me.save()

  return await group.save()
}


const updateGroup = async (parent, { groupId, title, description }, { Group }) => {

  const group = await Group.findOne({ _id: groupId })

  if (!group) {
    throw new ForbiddenError('This group does not exist.')
  }

  const existingGroup = await Group.findOne({ title }).lean()
  if (existingGroup && !existingGroup._id.equals(group._id)) {
    throw new ForbiddenError('You already have a group with this title.')
  }

  group.title = title
  group.description = description

  return await group.save()
}


const deleteGroup = async (parent, { groupId }, { Group, me }) => {

  const group = await Group.findOne({ _id: groupId }).lean()

  if (!group) {
    throw new ForbiddenError('This group does not exist.')
  }

  me.groups = me.groups.filter(myGroup => !myGroup._id.equals(group._id))
  await me.save()

  return await Group.findOneAndRemove({ _id: groupId })
}


const addMember = async (parent, { userId, groupId }, { Group, User, me }) => {

  const group = await Group.findOne({ _id: groupId })
  const user = await User.findOne({ _id: userId })

  switch (true) {
    case user._id.equals(me._id):
      throw new ForbiddenError('You already own this group.')

    case group.members.filter(member => member._id.equals(user._id)).length > 0:
      throw new ForbiddenError('The user is already a member of the group.')

    default:
      user.memberOf.push(group)
      await user.save()

      group.members.push(user)
      return await group.save()
  }
}


const removeMember = async (parent, { userId, groupId }, { Group, User, me }) => {

  const group = await Group.findOne({ _id: groupId })
  const user = await User.findOne({ _id: userId })

  switch (true) {
    case user._id.equals(me._id):
      throw new ForbiddenError('You already own this group.')

    case group.members.filter(member => member._id.equals(user._id)).length === 0:
      throw new ForbiddenError('The user is already not a member of the group.')

    default:
      user.memberOf = user.memberOf.filter(userGroup => !userGroup.equals(group._id))
      await user.save()

      group.members = group.members.filter(member => !member.equals(user._id))
      return await group.save()
  }
}


// =================================== //
//           Group Functions           //
// =================================== //

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


// =================================== //
//           Resolver Object           //
// =================================== //

export default {
  Query: {
    group: combineResolvers(ownsGroup, fetchGroup),
    groups: combineResolvers(isAuthenticated, fetchGroups)
  },

  Mutation: {
    createGroup: combineResolvers(isAuthenticated, createGroup),
    updateGroup: combineResolvers(ownsGroup, updateGroup),
    deleteGroup: combineResolvers(ownsGroup, deleteGroup),

    addToGroup: combineResolvers(ownsGroup, addMember),
    removeFromGroup: combineResolvers(ownsGroup, removeMember)
  },

  Group: {
    members: fetchGroupMembers,
    owner: fetchOwner
  }
}