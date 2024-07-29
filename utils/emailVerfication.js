const transporter = require('../config/emailConfig');
const emailVerficationModel = require('../models/emailVerficationModel');

const sendVerificationOTP = async (user) => {
  // generate random 4 digit otp
  const otp = Math.floor(1000 + Math.random() * 9000);

  // save otp in database
  const emailVerfication = await new emailVerficationModel({
    userId: user._id,
    otp,
  });
  await emailVerfication.save();

  // otp verification link
  const link = `${process.env.FRONTEND_HOST}/verify-email`;

  // send email
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'Verify your email',
    html: `<h2>Dear ${user.name}, </h2>
    <p>Please verify your email by clicking on the following link: <a href="${link}">Click here</a></p>
    <p>Your OTP is <strong>${otp}</strong></p>
    <p>Please make sure this otp is valid for only 15 minutes.</p>`,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = sendVerificationOTP;
