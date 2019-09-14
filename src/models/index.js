import mongoose from 'mongoose'
import User from './user'
import Group from './group'
import Hangout from './hangout'

// Mongo config
mongoose.connect(process.env.MONGO_URI, { useUnifiedTopology: true, useNewUrlParser: true })
mongoose.set('useFindAndModify', false)
mongoose.plugin(schema => { schema.options.usePushEach = true })
mongoose.Promise = global.Promise

export default { User, Group, Hangout }
