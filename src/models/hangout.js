import mongoose from 'mongoose'

const hangoutSchema = new mongoose.Schema({

  title: String,
  description: String,
  datetime: Date,
  location: String,

  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  invited: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],
  attendeeLimit: Number,

  // Hangout creation date
  created: { type: Date, default: Date.now },
})

export default mongoose.model('hangout', hangoutSchema)
