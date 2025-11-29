// 1. Mongoose ko import karo
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// 2. Product ka blueprint (Schema) banao
const productSchema = new Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: true, // Iske bina product save nahi hoga
    },
    brand: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true, // Jaise "men-casual", "women-sandals"
    },
    description: {
      type: String,
    },

    // Price Info (Aapki discount wali requirement)
    mrp: {
      // Asli Price
      type: Number,
      required: true,
    },
    salePrice: { // Apna Price
    type: Number,
    required: true
  },
  
  // --- YEH NAYA FIELD ADD KARO ---
  comparePrice: { // Jo cut-line me dikhegi (e.g., ₹300)
    type: Number 
  },

    // B2B Info
    moq: {
      type: Number,
      required: true,
      default: 1, // Agar set na karein toh default 1
    },
    isLoose: {
      type: Boolean,
      default: false,
    },
    sizes: [
      { type: String }, // Array of selected sizes (e.g., ["6", "7", "8"])
    ],
    // Photos (Aapki multiple images wali requirement)
    images: [
      { type: String }, // Yahaan URLs (links) ki list save hogi
    ],

    // Filters Info (Aapki filter wali requirement)
    material: {
      type: String,
    },
    color: {
      type: String,
    },

    sole: { type: String },
    closure: { type: String },
    origin: { type: String },

    // Tags (New Arrival, Top Best, etc.)
    tags: [{ type: String }],
  },
  { timestamps: true }
); // timestamps: true (automatic 'kab bana' date add kar dega)

// 3. Is blueprint (Schema) ko ek Model me badlo
// Model woh object hai jisse hum asli data find, create, update kar sakte hain
const Product = mongoose.model("ShoeonProduct", productSchema);
// 4. Is Model ko baaki files me use karne ke liye export karo
module.exports = Product;
