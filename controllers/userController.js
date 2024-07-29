const UserModel = require("../models/userModel");
const emailVerficationModel = require("../models/emailVerficationModel");
const refreshTokenModel = require("../models/refreshToken");
const bcrypt = require("bcrypt");
const sendVerificationOTP = require("../utils/emailVerfication");
const generateTokens = require("../utils/generateToken");
const jwt = require("jsonwebtoken");
const transporter = require("../config/emailConfig");

// register user
module.exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  // check if all fields are filled
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // check if user already exists
    const user = await UserModel.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
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
      .json({ message: "User registered successfully", user: savedUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// user email verification
module.exports.verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  // check if all fields are filled
  if (!email || !otp) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await UserModel.findOne({ email });

    // check if user exists
    if (!user) {
      return res
        .status(404)
        .json({ message: "User with this email does not exist..." });
    }

    // check if email is already verified
    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
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
          .json({ message: "Invalid OTP, new OTP sent to your email..." });
      }

      return res.status(400).json({ message: "Invalid OTP..." });
    }

    // if otp is valid then check expiration
    const currentTime = new Date();
    const expirationTime = new Date(
      emailVerfication.createdAt.getTime() + 15 * 60 * 1000
    );
    if (currentTime > expirationTime) {
      await sendVerificationOTP(user);
      return res.status(400).json({
        message: "OTP expired, new OTP sent to your email...",
      });
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: "Email verified successfully..." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

// login user
module.exports.login = async (req, res) => {
  const { email, password } = req.body;

  // check if all fields are filled
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await UserModel.findOne({ email });

    // check if user exists
    if (!user) {
      return res.status(404).json({ message: "Invalid email or password..." });
    }

    // check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password..." });
    }

    // check if user is verified
    if (!user.isVerified) {
      return res.status(400).json({
        message: "Your account is not verified, please verify first...",
      });
    }

    // generate tokens
    const { accessToken, refreshToken } = await generateTokens(user);

    // set access token to cookies
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 20 * 1000,
    });

    // set refresh token to cookies
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
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
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

// get new access token from refresh token
module.exports.getAccessToken = async (req, res) => {
  try {
    const oldRefreshToken = req.cookies.refresh_token;

    // check if refresh token exists in database
    const databaseRefreshToken = await refreshTokenModel.findOne({
      token: oldRefreshToken,
    });

    if (!databaseRefreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // jwt verify
    const tokenDetail = jwt.verify(
      oldRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    if (!tokenDetail) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // find user based on id
    const user = await UserModel.findById(tokenDetail.payload.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userRefreshToken = await refreshTokenModel.findOne({
      userId: tokenDetail.payload.id,
    });

    if (!userRefreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // generate tokens
    const { accessToken, refreshToken } = await generateTokens(user);

    // set access token to cookies
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 20 * 1000,
    });

    // set refresh token to cookies
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Access token generated successfully",
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
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

// get my profile details
module.exports.getMyProfileDetails = async (req, res) => {
  try {
    res.send(req.user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

// logout
module.exports.logout = async (req, res) => {
  try {
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

// change password
module.exports.changePassword = async (req, res) => {
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    return res.status(400).json({ message: "Both fields are required" });
  }

  if (password !== confirmPassword) {
    return res
      .status(400)
      .json({ message: "Password & confirm password do not match" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await UserModel.findByIdAndUpdate(req.user._id, {
      password: hashedPassword,
    });
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

// send password reset email
module.exports.passwordResetLink = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ message: "Email is required to reset the password" });
  }

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User with this email does not exist..." });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      }
    );

    const resetLink = `${process.env.FRONTEND_HOST}/reset-password-confirm/${token}`;

    // send email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Reset Your Password",
      html: `<h2>Dear ${user.name}, </h2>
    <p>Please reset your password by clicking on the following link: <a href="${resetLink}">Click here</a></p>
    <p>Please make sure this link is valid for only 15 minutes.</p>`,
    });

    res.status(200).json({
      message: "Password reset link has been sent to your email successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

// reset password using token
module.exports.resetPassword = async (req, res) => {
  const { password, confirmPassword, token } = req.body;

  if (!password || !confirmPassword) {
    return res
      .status(400)
      .json({ message: "Both password fields are required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      return res
        .status(404)
        .json({ message: "User with this email does not exist..." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await UserModel.findByIdAndUpdate(user._id, {
      password: hashedPassword,
    });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(400)
        .json({ message: "Password reset link has been expired" });
    }
    console.log(error);
    res.status(500).json({ message: "Internal server error", error: error });
  }
};
