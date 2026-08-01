const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { 
  getPendingUsers, 
  getAllUsers, 
  updateUserStatus, 
  getDashboardStats 
} = require('../controllers/adminController');

// Sab routes protected hain — sirf logged-in admin access kar sakta hai
router.use(protect, isAdmin);

router.get('/pending-users', getPendingUsers);
router.get('/all-users', getAllUsers);
router.patch('/update-status/:userId', updateUserStatus);
router.get('/dashboard-stats', getDashboardStats);

module.exports = router;