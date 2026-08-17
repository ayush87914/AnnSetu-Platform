const mongoose = require('mongoose');

const foodDonationSchema = new mongoose.Schema({
  // Kisne post kiya (Restaurant)
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Food Details
  foodName: { type: String, required: true },
  foodType: { 
    type: String, 
    enum: ['veg', 'non-veg', 'both'], 
    required: true 
  },
  quantity: { type: String, required: true }, // e.g. "10 kg" or "20 plates"
  cookingTime: { type: Date, required: true },
  expiryTime: { type: Date, required: true },

  // Image
  foodImage: { type: String }, // Cloudinary URL later, abhi optional

  // Pickup Location
  pickupAddress: { type: String, required: true },
  pickupLocation: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  contactNumber: { type: String, required: true },

  // System Check
  isExpiryValid: { type: Boolean, default: true },
  isComplete: { type: Boolean, default: true },

  // Status flow (flowchart ke hisaab se)
  status: {
    type: String,
    enum: ['pending', 'matched', 'accepted', 'picked_up', 'delivered', 'cancelled'],
    default: 'pending'
  },

  // NGO jisne accept kiya
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // Volunteer jo pickup/deliver karega
  assignedVolunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // Delivery proof
  deliveryProofImage: { type: String },
  pickupOTP: { type: String },
  deliveryOTP: { type: String },
  isDelivered: { type: Boolean, default: false },
  deliveredAt: { type: Date },

  // Ratings & Feedback (NGO rates Restaurant + Volunteer after delivery)
  restaurantRating: { type: Number, min: 1, max: 5 },
  volunteerRating: { type: Number, min: 1, max: 5 },
  feedbackComment: { type: String },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FoodDonation', foodDonationSchema);