import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {

    hangout(
      hangoutId: ID!
    ): Hangout!

    hangouts: [Hangout!]

  }

  extend type Mutation {

    createHangout(
      title: String!
      description: String!
      datetime: DateTime!
      location: String!
      attendeeLimit: Int
    ): Hangout!

    updateHangout(
      hangoutId: String!
      title: String!
      description: String!
      datetime: DateTime!
      location: String!
      attendeeLimit: Int
    ): Hangout!

    deleteHangout(
      hangoutId: ID!
    ): Hangout!

    joinHangout(
      hangoutId: ID!
    ): Hangout!

    leaveHangout(
      hangoutId: ID!
    ): Hangout!

    inviteUser(
      hangoutId: ID!, 
      userId: ID!
    ): Hangout!

    uninviteUser(
      hangoutId: ID!,
      userId: ID!
    ): Hangout!

  }

  type Hangout {
    _id: ID!
    title: String!
    description: String!
    datetime: DateTime!
    location: String!
    organizer: User!
    invited: [User!]
    attendees: [User!]
    attendeeLimit: Int
  }
`