const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { register, verifyOTP, resendOTP, login, forgotPassword, resetPassword, updateProfile, getMyProfile } = require('../controllers/authController');

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/my-profile', protect, getMyProfile);
router.patch('/update-profile', protect, updateProfile);

module.exports = router;