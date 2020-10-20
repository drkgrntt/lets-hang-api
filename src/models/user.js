import { Schema, model } from 'mongoose'
import passportLocalMongoose from 'passport-local-mongoose'

const userSchema = new Schema({

  username: String,
  password: String,

  // Personal Info
  email: String,
  firstName: String,
  lastName: String,

  // Group info
  groups: [{
    type: Schema.Types.ObjectId,
    ref: 'group'
  }],
  memberOf: [{
    type: Schema.Types.ObjectId,
    ref: 'group'
  }],

  // Hangout info
  hangouts: [{
    type: Schema.Types.ObjectId,
    ref: 'hangout'
  }],
  invitedTo: [{
    type: Schema.Types.ObjectId,
    ref: 'hangout'
  }],
  attending: [{
    type: Schema.Types.ObjectId,
    ref: 'hangout'
  }],

  // Account creation date
  created: { type: Date, default: Date.now },
})

userSchema.plugin(passportLocalMongoose)

export default model('user', userSchema)
