const express = require('express');
const router = express.Router();
const {
  register,
  verifyEmail,
  login,
} = require('../controllers/userController');

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/login', login);

module.exports = router;
