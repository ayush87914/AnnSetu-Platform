const express = require('express');
const router = express.Router();
const { getImpactStats } = require('../controllers/publicController');

// No auth needed - public route
router.get('/impact-stats', getImpactStats);

module.exports = router;