import mongoose from 'mongoose'

const groupSchema = new mongoose.Schema({

  title: String,
  description: String,

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],

  // Group creation date
  created: { type: Date, default: Date.now },
})

export default mongoose.model('group', groupSchema)
