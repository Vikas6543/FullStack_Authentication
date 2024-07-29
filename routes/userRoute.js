const express = require('express');
const router = express.Router();
const {
  register,
  verifyEmail,
  login,
  getAccessToken,
  getMyProfileDetails,
  logout,
  changePassword,
  passwordResetLink,
  resetPassword,
} = require('../controllers/userController');
const passport = require('passport');
const accessTokenAutoRefresh = require('../middlewares/tokenAutoRefresh');

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
  accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  getMyProfileDetails
);

// logout route => get method
router.get('/logout', logout);

// change password route => post method
router.post(
  '/change-password',
  accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  changePassword
);

// password reset link route => post method
router.post('/password-reset-link', passwordResetLink);

// reset password route => post method
router.post('/reset-password', resetPassword);

module.exports = router;
