const express = require('express');
const { registerUser, loginUser, getCurrentUser } = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', verifyToken, getCurrentUser);

module.exports = router;
