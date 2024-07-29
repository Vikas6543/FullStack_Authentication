const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  roles: {
    type: [String],
    enum: ['user', 'admin'],
    default: ['user'],
  },
});

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
