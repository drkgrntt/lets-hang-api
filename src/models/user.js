import mongoose from 'mongoose'
import passportLocalMongoose from 'passport-local-mongoose'

const userSchema = new mongoose.Schema({

  username: String,
  password: String,

  // Personal Info
  email: String,
  firstName: String,
  lastName: String,

  groups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'group'
  }],
  hangouts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'hangout'
  }],

  // Account creation date
  created: { type: Date, default: Date.now },
})

userSchema.plugin(passportLocalMongoose)

export default mongoose.model('user', userSchema)
