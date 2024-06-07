const jwt = require('jsonwebtoken');
const refreshTokenModel = require('../models/refreshToken');

const generateTokens = async (user) => {
  try {
    const payload = {
      id: user._id,
      roles: user.roles,
    };

    // generate access token
    const accessToken = jwt.sign(
      {
        payload,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: '20s',
      }
    );

    // generate refresh token
    const refreshToken = jwt.sign(
      {
        payload,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: '1d',
      }
    );

    // check if refresh token exists
    const userRefreshToken = await refreshTokenModel.findOne({
      userId: user._id,
    });

    // if refresh token exists, delete it
    if (userRefreshToken) {
      await refreshTokenModel.findByIdAndDelete(userRefreshToken._id);
    }

    // create new refresh token and save it to database
    const newRefreshToken = await new refreshTokenModel({
      userId: user._id,
      token: refreshToken,
    });

    await newRefreshToken.save();

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
  }
};

module.exports = generateTokens;
