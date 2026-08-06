const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleCheck');
const {
  createDonation,
  getMyDonations,
  getDonationById,
  cancelDonation,
  getAvailableDonations,
  acceptDonation,
  getMyAcceptedDonations,
  getAvailablePickups,
  assignVolunteer,
  markPickedUp,
  generateDeliveryOTP,
  confirmDelivery,
  getMyVolunteerTasks,
  generatePickupOTP,
  verifyPickupOTP
} = require('../controllers/donationController');

router.use(protect);

// Restaurant routes
router.post('/create', checkRole('restaurant'), createDonation);
router.get('/my-donations', checkRole('restaurant'), getMyDonations);
router.patch('/cancel/:id', checkRole('restaurant'), cancelDonation);
router.post('/generate-pickup-otp/:id', checkRole('restaurant'), generatePickupOTP);

// NGO routes
router.get('/available/nearby', checkRole('ngo'), getAvailableDonations);
router.patch('/accept/:id', checkRole('ngo'), acceptDonation);
router.get('/ngo/my-accepted', checkRole('ngo'), getMyAcceptedDonations);
router.patch('/confirm-delivery/:id', checkRole('ngo'), confirmDelivery);

// Volunteer routes
router.get('/volunteer/available-pickups', checkRole('volunteer'), getAvailablePickups);
router.patch('/volunteer/assign/:id', checkRole('volunteer'), assignVolunteer);
router.patch('/volunteer/picked-up/:id', checkRole('volunteer'), markPickedUp);
router.post('/volunteer/generate-otp/:id', checkRole('volunteer'), generateDeliveryOTP);
router.get('/volunteer/my-tasks', checkRole('volunteer'), getMyVolunteerTasks);
router.patch('/volunteer/verify-pickup-otp/:id', checkRole('volunteer'), verifyPickupOTP);

// Common (dono access kar sakte hain)
router.get('/:id', getDonationById);

module.exports = router;