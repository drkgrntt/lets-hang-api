import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {

    currentUser: User

    user(id: ID!): User

    users(search: String!): [User!]

    checkEmail(email: EmailAddress!): Boolean!

  }

  extend type Mutation {

    createUser(
      firstName: String!,
      lastName: String!,
      email: EmailAddress!,
      password: String!
    ): Token!

    loginUser(
      email: EmailAddress!,
      password: String!
    ): Token!

  }

  type User {
    _id: ID!
    email: String!
    firstName: String!
    lastName: String!
    groups: [Group!]
    memberOf: [Group!]
    hangouts: [Hangout!]
    invitedTo: [Hangout!]
    attending: [Hangout!]
  }

  type Token {
    token: String!
  }
`