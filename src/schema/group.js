import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {

    group(
      groupId: String!
    ): Group!

    groups: [Group!]

  }

  extend type Mutation {

    createGroup(
      title: String!,
      description: String!
    ): Group!

    updateGroup(
      groupId: ID!,
      title: String!,
      description: String!
    ): Group!

    deleteGroup(
      groupId: ID!
    ): Group!

    addToGroup(
      groupId: ID!,
      userId: ID!
    ): Group!

    removeFromGroup(
      groupId: ID!,
      userId: ID!
    ): Group!

  }

  type Group {
    _id: ID!
    title: String!
    description: String!
    owner: User!
    members: [User!]
  }
`