const express = require('express');
const router = express.Router();
const {
  register,
  verifyEmail,
  login,
  getAccessToken,
} = require('../controllers/userController');

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/get-access-token', getAccessToken);

module.exports = router;
