const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  
  // 1. Personal Details
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true }, // Phone number unique hona chahiye
  password: { type: String, required: true },
  
  // 2. Shop Details (B2B ke liye zaroori)
  shopName: { type: String, required: true },
  shopAddress: { type: String, required: true },
  gstNumber: { type: String }, // Optional
  
  // 3. Approval Status (Sabse Important)
  // Default 'false' rahega, jab tak Admin approve na kare
  isApproved: { 
    type: Boolean, 
    default: false 
  },
  // (B2B Credit Control)
  isCreditApproved: { // Agar Admin ne haan kaha toh 'true' hoga
    type: Boolean,
    default: false
  },
  creditTermsDays: { // Credit period kitne din ka hai (e.g., 2, 7, 15)
    type: Number,
    default: 0
  },
  creditLimit: { // Optional: Max kitne ka udhaar de sakte hain
    type: Number,
    default: 0
  },
  // 4. Role (Customer hai ya Admin)
  isAdmin: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

const User = mongoose.model('ShoeonUser', userSchema);

module.exports = User;