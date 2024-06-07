const express = require('express');
const router = express.Router();
const {
  register,
  verifyEmail,
  login,
  getAccessToken,
  getMyProfileDetails,
} = require('../controllers/userController');
const passport = require('passport');
const setAuthHeader = require('../middlewares/setAuthHeader');

// register route => post method
router.post('/register', register);

// verify email route => post method
router.post('/verify-email', verifyEmail);

// login route => post method
router.post('/login', login);

// get access token from refresh token => post method
router.post('/get-access-token', getAccessToken);

// get my profile details => get method (protected route)
router.get(
  '/my-profile',
  setAuthHeader,
  passport.authenticate('jwt', { session: false }),
  getMyProfileDetails
);

module.exports = router;
