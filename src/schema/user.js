import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    currentUser: User
    user(id: ID!): User
    users: [User!]
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
    hangouts: [Hangout!]
  }

  type Token {
    token: String!
  }
`