const express = require('express');
const router = express.Router();
const { register, verifyEmail } = require('../controllers/userController');

router.post('/register', register);
router.post('/verify-email', verifyEmail);

module.exports = router;
