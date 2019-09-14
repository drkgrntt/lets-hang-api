import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    group(id: String!): Group!
    groups: [Group!]
  }

  extend type Mutation {
    createGroup(
      title: String!,
      description: String!
    ): Group!
    deleteGroup(id: ID!): Group!
    addMember(groupId: ID!, userId: ID!): Group!
  }

  type Group {
    _id: ID!
    title: String!
    description: String!
    owner: User!
    members: [User!]
  }
`