const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['restaurant', 'ngo', 'volunteer', 'admin'], 
    required: true 
  },
  businessInfo: { type: String },
  ngoInfo: { type: String },
  idProof: { type: String },

  isVerified: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },

  otp: { type: String },
  otpExpiry: { type: Date },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);