const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const settingSchema = new Schema({
  // 1. Home Page Slider Images (Array of URLs)
  banners: [
    { type: String }
  ],
  
  // 2. Contact Info
  supportPhone: { type: String, default: '+91 0000000000' },
  supportEmail: { type: String, default: 'support@shoeon.com' }

}, { timestamps: true });

const Setting = mongoose.model('Setting', settingSchema);
module.exports = Setting;