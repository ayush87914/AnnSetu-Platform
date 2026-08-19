const express = require('express');
const router = express.Router();
const { getImpactStats } = require('../controllers/publicController');
const { getAvailableDonations } = require('../controllers/donationController');

// No auth needed - public routes
router.get('/impact-stats', getImpactStats);
router.get('/available-food', getAvailableDonations);

module.exports = router;