const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  
  // 1. Customer ki Details
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  shopName: { type: String },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  shippingAddress: { type: String, required: true },
  pincode: { type: String },
  city: { type: String },

  // 2. Order ki Details
  orderItems: [
    {
      productId: { type: String }, 
      name: { type: String },
      brand: { type: String },
      price: { type: Number },
      moq: { type: Number, default: 1 },
      packs: { type: Number, default: 1 },  
      quantity: { type: Number, required: true }, 
      img: { type: String }
    }
  ],
  
  // (Yahan se wo galat ProductSchema hata diya hai)

  totalAmount: {
    type: Number,
    required: true
  },

  advancePaid: { type: Number, default: 0 },
    balanceAmount: { type: Number, default: 0 },
  
  // 3. Status
  status: {
    type: String,
    required: true,
    default: 'Pending'
  },
  
  paymentMethod: {
    type: String,
    required: true,
    default: 'Online'
  }, 
  paymentId: { type: String },
  
}, { timestamps: true });

orderSchema.index({ createdAt: -1 });

const Order = mongoose.model('ShoeonOrder', orderSchema);

module.exports = Order;