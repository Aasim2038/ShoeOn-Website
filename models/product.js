// 1. Mongoose ko import karo
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 2. Product ka blueprint (Schema) banao
const productSchema = new Schema({
  
  // Basic Info
  name: {
    type: String,
    required: true // Iske bina product save nahi hoga
  },
  brand: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true // Jaise "men-casual", "women-sandals"
  },
  description: {
    type: String
  },

  // Price Info (Aapki discount wali requirement)
  mrp: { // Asli Price
    type: Number,
    required: true
  },
  salePrice: { // Discounted Price
    type: Number,
    required: true
  },
  
  // B2B Info
  moq: {
    type: Number,
    required: true,
    default: 1 // Agar set na karein toh default 1
  },

  // Photos (Aapki multiple images wali requirement)
  images: [
    { type: String } // Yahaan URLs (links) ki list save hogi
  ],
  
  // Filters Info (Aapki filter wali requirement)
  material: {
    type: String
  },
  color: {
    type: String
  },

  sole: { type: String },
  closure: { type: String },
  origin: { type: String },
  
  // Tags (New Arrival, Top Best, etc.)
  tags: [
    { type: String }
  ]
  
}, { timestamps: true }); // timestamps: true (automatic 'kab bana' date add kar dega)


// 3. Is blueprint (Schema) ko ek Model me badlo
// Model woh object hai jisse hum asli data find, create, update kar sakte hain
const Product = mongoose.model('ShoeonProduct', productSchema);
// 4. Is Model ko baaki files me use karne ke liye export karo
module.exports = Product;