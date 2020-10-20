import { gql } from 'apollo-server-express'

import userSchema from './user'
import groupSchema from './group'
import hangoutSchema from './hangout'

const linkSchema = gql`
  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }

  type Subscription {
    _: Boolean
  }

  scalar DateTime
  scalar EmailAddress
  scalar NegativeFloat
  scalar NegativeInt
  scalar NonNegativeFloat
  scalar NonNegativeInt
  scalar NonPositiveFloat
  scalar NonPositiveInt
  scalar PhoneNumber
  scalar PositiveFloat
  scalar PositiveInt
  scalar PostalCode
  scalar UnsignedFloat
  scalar UnsignedInt
  scalar URL
  scalar BigInt
  scalar Long
  scalar GUID
  scalar HexColorCode
  scalar HSL
  scalar HSLA
  scalar IPv4
  scalar IPv6
  scalar ISBN
  scalar MAC
  scalar Port
  scalar RGB
  scalar RGBA
  scalar USCurrency
  scalar JSON
  scalar JSONObject
  scalar UtcOffset
  scalar Hexadecimal
  scalar IBAN
  scalar ObjectID
  scalar Void
`

export default [linkSchema, userSchema, groupSchema, hangoutSchema]
