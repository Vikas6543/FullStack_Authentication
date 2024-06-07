const UserModel = require('../models/userModel');
const passport = require('passport');
const { Strategy, ExtractJwt } = require('passport-jwt');

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.ACCESS_TOKEN_SECRET,
};

passport.use(
  new Strategy(options, async (payload, done) => {
    try {
      const user = await UserModel.findById(
        { _id: payload.payload.id },
        '-password'
      );
      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    } catch (error) {
      done(error, false);
    }
  })
);

module.exports = passport;
