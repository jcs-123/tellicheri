import mongoose from 'mongoose';

const userLogSchema = new mongoose.Schema({
  username: String,
  activity: String,
  operation: {
    type: String,
    enum: ['Sign In', 'Sign Out'],
  },
}, { timestamps: true });

const UserLog = mongoose.model('UserLog', userLogSchema);
export default UserLog;
