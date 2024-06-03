const transporter = require('../config/emailConfig');

const sendVerificationOTP = async (req, user) => {
  // generate random 4 digit otp
  const otp = Math.floor(1000 + Math.random() * 9000);

  // otp verification link
  const link = `${process.env.FRONTEND_HOST}/verify-email`;

  // send email
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'Verify your email',
    html: `<p>Dear ${user.name}, </p>
    <p>Please verify your email by clicking on the following link: ${link}</p>
    <h2>Your OTP is ${otp}</h2>
    <p>please make sure that this otp is valid for only 15 minutes.</p>`,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = sendVerificationOTP;
