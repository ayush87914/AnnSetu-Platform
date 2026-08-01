const User = require('../models/User');

// ============ GET ALL PENDING USERS ============
exports.getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ 
      status: 'pending', 
      isEmailVerified: true,
      role: { $ne: 'admin' } 
    }).select('-password');

    res.status(200).json({ count: pendingUsers.length, users: pendingUsers });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============ GET ALL USERS (any status) ============
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query; // optional filter: ?role=restaurant

    const filter = { role: { $ne: 'admin' } };
    if (role) filter.role = role;

    const users = await User.find(filter).select('-password');

    res.status(200).json({ count: users.length, users });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============ APPROVE / REJECT USER ============
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isEmailVerified) {
      return res.status(400).json({ message: 'User has not verified their email yet' });
    }

    user.status = status;
    user.isVerified = status === 'approved';
    await user.save();

    res.status(200).json({ 
      message: `User ${status} successfully`, 
      user: { id: user._id, name: user.name, email: user.email, status: user.status } 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============ DASHBOARD STATS ============
exports.getDashboardStats = async (req, res) => {
  try {
    const totalRestaurants = await User.countDocuments({ role: 'restaurant', status: 'approved' });
    const totalNGOs = await User.countDocuments({ role: 'ngo', status: 'approved' });
    const totalVolunteers = await User.countDocuments({ role: 'volunteer', status: 'approved' });
    const pendingApprovals = await User.countDocuments({ status: 'pending', isEmailVerified: true, role: { $ne: 'admin' } });

    res.status(200).json({
      totalRestaurants,
      totalNGOs,
      totalVolunteers,
      pendingApprovals
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};