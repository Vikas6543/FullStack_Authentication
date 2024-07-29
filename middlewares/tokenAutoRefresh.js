const jwt = require('jsonwebtoken');
const generateTokens = require('../utils/generateToken');
const refreshTokenModel = require('../models/refreshToken');
const UserModel = require('../models/userModel');

// adding accesstoken to cookies and headers automatically once it expires
const accessTokenAutoRefresh = async (req, res, next) => {
  try {
    const accessToken = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;

    if (accessToken) {
      req.headers['authorization'] = `Bearer ${accessToken}`;
    }

    if (!refreshToken) {
      return next();
    }

    // check if refresh token exists in database
    const databaseRefreshToken = await refreshTokenModel.findOne({
      token: refreshToken,
    });

    if (!databaseRefreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // jwt verify
    const tokenDetail = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    if (!tokenDetail) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // find user based on id
    const user = await UserModel.findById(tokenDetail.payload.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userRefreshToken = await refreshTokenModel.findOne({
      userId: tokenDetail.payload.id,
    });

    if (!userRefreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // generate tokens
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateTokens(user);

    // set access token to cookies
    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 20 * 1000,
    });

    // set refresh token to cookies
    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    req.headers['authorization'] = `Bearer ${newAccessToken}`;

    next();
  } catch (error) {
    console.log(error);
  }
};

module.exports = accessTokenAutoRefresh;
