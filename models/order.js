const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  
  // 1. Customer ki Details
  orderNumber: {
    type: String,
    required: true,
    unique: true // Taaki do order ka same number na ho
  },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  shippingAddress: { type: String, required: true },
  pincode: { type: String},
  city: { type: String},

  // 2. Order ki Details
  orderItems: [
    {
      productId: { type: String }, // Hum product ki ID save karenge
      name: { type: String },
      brand: { type: String },
      price: { type: Number },
      moq: { type: Number }
    }
  ],
  
  totalAmount: {
    type: Number,
    required: true
  },
  
  // 3. Status
  status: {
    type: String,
    required: true,
    default: 'Pending' // Naya order hamesha Pending rahega
  },
  
  paymentMethod: {
    type: String,
    required: true,
    default: 'Online'
  },
  paymentId: { type: String },
  
}, { timestamps: true }); // Order kab aaya, woh time save karega


const Order = mongoose.model('ShoeonOrder', orderSchema);

module.exports = Order;