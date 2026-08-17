const User = require('../models/User');
const FoodDonation = require('../models/FoodDonation');

// ============ PUBLIC IMPACT STATS (no login required) ============
exports.getImpactStats = async (req, res) => {
  try {
    const totalRestaurants = await User.countDocuments({ role: 'restaurant', status: 'approved' });
    const totalNGOs = await User.countDocuments({ role: 'ngo', status: 'approved' });
    const totalVolunteers = await User.countDocuments({ role: 'volunteer', status: 'approved' });
    const totalDonationsPosted = await FoodDonation.countDocuments({});
    const totalMealsDelivered = await FoodDonation.countDocuments({ status: 'delivered' });

    res.status(200).json({
      totalRestaurants,
      totalNGOs,
      totalVolunteers,
      totalDonationsPosted,
      totalMealsDelivered
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};