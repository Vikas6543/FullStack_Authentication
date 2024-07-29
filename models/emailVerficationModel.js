const mongoose = require('mongoose');

const emailVerficationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '15m',
  },
});

const EmailVerfication = mongoose.model(
  'emailVerfication',
  emailVerficationSchema
);

module.exports = EmailVerfication;
