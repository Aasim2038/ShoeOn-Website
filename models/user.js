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

  isCashAllowed: { type: Boolean, default: false },
  
  isOfflineCustomer: { type: Boolean, default: false },

  // 4. Role (Customer hai ya Admin)
  isAdmin: {
    type: Boolean,
    default: false
  },

  //5 reset password 
  resetPasswordOtp: {
    type: String, // String rakho taaki agar '0123' ho to zero na hate
    default: undefined
  },
  resetPasswordExpires: {
    type: Date,
    default: undefined
  },
  

  email: { 
    type: String, 
    required: true, 
    unique: true // Ek email se ek hi account banega
  },

  advancePercent: { type: Number, default: 20 },

}, { timestamps: true });

const User = mongoose.model('ShoeonUser', userSchema);

module.exports = User;