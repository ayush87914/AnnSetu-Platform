const FoodDonation = require('../models/FoodDonation');

// ============ CREATE DONATION (Restaurant only) ============
exports.createDonation = async (req, res) => {
  try {
    const {
      foodName,
      foodType,
      quantity,
      cookingTime,
      expiryTime,
      foodImage,
      pickupAddress,
      latitude,
      longitude,
      contactNumber
    } = req.body;

    // Basic required field check
    if (!foodName || !foodType || !quantity || !cookingTime || !expiryTime || !pickupAddress || !latitude || !longitude || !contactNumber) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    // SYSTEM CHECK (jaisa flowchart mein hai)
    const now = new Date();
    const expiry = new Date(expiryTime);

    const isExpiryValid = expiry > now;

    if (!isExpiryValid) {
      return res.status(400).json({ message: 'Expiry time must be in the future. Food already expired.' });
    }

    const newDonation = new FoodDonation({
      donor: req.user._id,
      foodName,
      foodType,
      quantity,
      cookingTime,
      expiryTime,
      foodImage,
      pickupAddress,
      pickupLocation: { latitude, longitude },
      contactNumber,
      isExpiryValid: true,
      isComplete: true,
      status: 'pending'
    });

    await newDonation.save();

    res.status(201).json({
      message: 'Food donation posted successfully! Nearby NGOs will be notified.',
      donation: newDonation
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============ GET MY DONATIONS (Restaurant dashboard) ============
exports.getMyDonations = async (req, res) => {
  try {
    const donations = await FoodDonation.find({ donor: req.user._id })
      .sort({ createdAt: -1 })
      .populate('acceptedBy', 'name email phone')
      .populate('assignedVolunteer', 'name phone');

    res.status(200).json({ count: donations.length, donations });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============ GET SINGLE DONATION (details) ============
exports.getDonationById = async (req, res) => {
  try {
    const donation = await FoodDonation.findById(req.params.id)
      .populate('donor', 'name phone businessInfo')
      .populate('acceptedBy', 'name email phone')
      .populate('assignedVolunteer', 'name phone');

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    res.status(200).json({ donation });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============ CANCEL DONATION (Restaurant only, only if still pending) ============
exports.cancelDonation = async (req, res) => {
  try {
    const donation = await FoodDonation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only cancel your own donations' });
    }

    if (donation.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot cancel. Donation already matched/accepted.' });
    }

    donation.status = 'cancelled';
    await donation.save();

    res.status(200).json({ message: 'Donation cancelled successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// ============ GET AVAILABLE DONATIONS FOR NGO (Nearby, Pending) ============
exports.getAvailableDonations = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance } = req.query; 
    // maxDistance in KM, optional — default 20km

    const donations = await FoodDonation.find({ status: 'pending' })
      .populate('donor', 'name phone businessInfo')
      .sort({ createdAt: -1 });

    // Agar NGO ne apni location bheji hai, toh distance calculate karke sort/filter karenge
    if (latitude && longitude) {
      const dist = maxDistance ? parseFloat(maxDistance) : 20; // default 20km

      const donationsWithDistance = donations.map((donation) => {
        const distanceKm = calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          donation.pickupLocation.latitude,
          donation.pickupLocation.longitude
        );
        return { ...donation.toObject(), distanceKm: distanceKm.toFixed(2) };
      });

      const nearbyDonations = donationsWithDistance
        .filter((d) => parseFloat(d.distanceKm) <= dist)
        .sort((a, b) => a.distanceKm - b.distanceKm);

      return res.status(200).json({ count: nearbyDonations.length, donations: nearbyDonations });
    }

    // Agar location nahi bheji, sab pending donations bhej do
    res.status(200).json({ count: donations.length, donations });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============ ACCEPT DONATION (NGO only) ============
exports.acceptDonation = async (req, res) => {
  try {
    const donation = await FoodDonation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.status !== 'pending') {
      return res.status(400).json({ message: 'This donation is no longer available' });
    }

    donation.status = 'accepted';
    donation.acceptedBy = req.user._id;
    await donation.save();

    res.status(200).json({ 
      message: 'Donation accepted successfully! Restaurant will be notified.', 
      donation 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============ GET MY ACCEPTED DONATIONS (NGO dashboard) ============
exports.getMyAcceptedDonations = async (req, res) => {
  try {
    const donations = await FoodDonation.find({ acceptedBy: req.user._id })
      .populate('donor', 'name phone businessInfo')
      .populate('assignedVolunteer', 'name phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ count: donations.length, donations });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============ HELPER: Calculate distance between 2 coordinates (Haversine formula) ============
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in KM
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
// ============ GET AVAILABLE PICKUPS FOR VOLUNTEER (accepted, no volunteer assigned) ============
exports.getAvailablePickups = async (req, res) => {
  try {
    const donations = await FoodDonation.find({ 
      status: 'accepted', 
      assignedVolunteer: null 
    })
      .populate('donor', 'name phone pickupAddress')
      .populate('acceptedBy', 'name phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ count: donations.length, donations });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============ VOLUNTEER ACCEPTS PICKUP TASK ============
exports.assignVolunteer = async (req, res) => {
  try {
    const donation = await FoodDonation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.status !== 'accepted') {
      return res.status(400).json({ message: 'This donation is not ready for pickup yet' });
    }

    if (donation.assignedVolunteer) {
      return res.status(400).json({ message: 'A volunteer is already assigned to this donation' });
    }

    donation.assignedVolunteer = req.user._id;
    await donation.save();

    res.status(200).json({ 
      message: 'Pickup task assigned to you successfully!', 
      donation 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============ MARK AS PICKED UP (Volunteer at Restaurant) ============
exports.markPickedUp = async (req, res) => {
  try {
    const donation = await FoodDonation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.assignedVolunteer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not assigned to this donation' });
    }

    if (donation.status !== 'accepted') {
      return res.status(400).json({ message: 'Invalid status for pickup' });
    }

    donation.status = 'picked_up';
    await donation.save();

    res.status(200).json({ message: 'Marked as picked up from restaurant!', donation });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============ GENERATE DELIVERY OTP (when volunteer reaches NGO) ============
exports.generateDeliveryOTP = async (req, res) => {
  try {
    const donation = await FoodDonation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.assignedVolunteer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not assigned to this donation' });
    }

    if (donation.status !== 'picked_up') {
      return res.status(400).json({ message: 'Food must be picked up first' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    donation.deliveryOTP = otp;
    await donation.save();

    // NOTE: Ideally yeh OTP NGO ko email/SMS se jaana chahiye
    // Abhi ke liye response mein bhej rahe hain testing ke liye
    res.status(200).json({ 
      message: 'Delivery OTP generated. Share this with the NGO to confirm delivery.', 
      otp 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============ CONFIRM DELIVERY (NGO enters OTP) ============
exports.confirmDelivery = async (req, res) => {
  try {
    const { otp } = req.body;
    const donation = await FoodDonation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.acceptedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the accepting NGO can confirm delivery' });
    }

    if (donation.status !== 'picked_up') {
      return res.status(400).json({ message: 'Delivery not in progress' });
    }

    if (donation.deliveryOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    donation.status = 'delivered';
    donation.isDelivered = true;
    donation.deliveredAt = new Date();
    donation.deliveryOTP = undefined;
    await donation.save();

    res.status(200).json({ message: 'Delivery confirmed successfully! 🎉', donation });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============ GET MY VOLUNTEER TASKS ============
exports.getMyVolunteerTasks = async (req, res) => {
  try {
    const donations = await FoodDonation.find({ assignedVolunteer: req.user._id })
      .populate('donor', 'name phone pickupAddress')
      .populate('acceptedBy', 'name phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ count: donations.length, donations });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// ============ GENERATE PICKUP OTP (Restaurant generates when volunteer arrives) ============
exports.generatePickupOTP = async (req, res) => {
  try {
    const donation = await FoodDonation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only generate OTP for your own donations' });
    }

    if (donation.status !== 'accepted') {
      return res.status(400).json({ message: 'Donation must be accepted by NGO and have a volunteer assigned first' });
    }

    if (!donation.assignedVolunteer) {
      return res.status(400).json({ message: 'No volunteer assigned yet' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    donation.pickupOTP = otp;
    await donation.save();

    res.status(200).json({
      message: 'Pickup OTP generated. Share this with the volunteer to confirm pickup.',
      otp
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============ VERIFY PICKUP OTP (Volunteer enters OTP given by restaurant) ============
exports.verifyPickupOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const donation = await FoodDonation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.assignedVolunteer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not assigned to this donation' });
    }

    if (donation.status !== 'accepted') {
      return res.status(400).json({ message: 'Invalid status for pickup verification' });
    }

    if (!donation.pickupOTP) {
      return res.status(400).json({ message: 'Restaurant has not generated a pickup OTP yet' });
    }

    if (donation.pickupOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    donation.status = 'picked_up';
    donation.pickupOTP = undefined;
    await donation.save();

    res.status(200).json({ message: 'Pickup verified successfully!', donation });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};