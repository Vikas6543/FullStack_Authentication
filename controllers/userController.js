const UserModel = require('../models/userModel');
const emailVerficationModel = require('../models/emailVerficationModel');
const bcrypt = require('bcrypt');
const sendVerificationOTP = require('../utils/emailVerfication');
const generateTokens = require('../utils/generateToken');

// register user
module.exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  // check if all fields are filled
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // check if user already exists
    const user = await UserModel.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create new user
    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
    });

    // save user
    const savedUser = await newUser.save();

    // send email verification
    sendVerificationOTP(savedUser);

    res
      .status(201)
      .json({ message: 'User registered successfully', user: savedUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// user email verification
module.exports.verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  // check if all fields are filled
  if (!email || !otp) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const user = await UserModel.findOne({ email });

    // check if user exists
    if (!user) {
      return res
        .status(404)
        .json({ message: 'User with this email does not exist...' });
    }

    // check if email is already verified
    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    const emailVerfication = await emailVerficationModel.findOne({
      userId: user._id,
      otp,
    });

    // check if otp is valid
    if (!emailVerfication) {
      if (!user.isVerified) {
        sendVerificationOTP(user);
        return res
          .status(400)
          .json({ message: 'Invalid OTP, new OTP sent to your email...' });
      }

      return res.status(400).json({ message: 'Invalid OTP...' });
    }

    // if otp is valid then check expiration
    const currentTime = new Date();
    const expirationTime = new Date(
      emailVerfication.createdAt.getTime() + 15 * 60 * 1000
    );
    if (currentTime > expirationTime) {
      await sendVerificationOTP(user);
      return res.status(400).json({
        message: 'OTP expired, new OTP sent to your email...',
      });
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully...' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error', error: error });
  }
};

// login user
module.exports.login = async (req, res) => {
  const { email, password } = req.body;

  // check if all fields are filled
  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const user = await UserModel.findOne({ email });

    // check if user exists
    if (!user) {
      return res.status(404).json({ message: 'Invalid email or password...' });
    }

    // check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password...' });
    }

    // check if user is verified
    if (!user.isVerified) {
      return res.status(400).json({
        message: 'Your account is not verified, please verify first...',
      });
    }

    // generate tokens
    const { accessToken, refreshToken } = await generateTokens(user);

    // set access token to cookies
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 12 * 60 * 60 * 1000,
    });

    // set refresh token to cookies
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: 'Login successful',
      user: {
        name: user.name,
        email: user.email,
        id: user._id,
        roles: user.roles,
      },
      access_token: accessToken,
      refresh_token: refreshToken,
      is_authenticated: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error', error: error });
  }
};
