const mongoose = require('mongoose');

const highlightSchema = new mongoose.Schema({
    type: { type: String, enum: ['image', 'video'], required: true },
    url: { type: String, required: true },
    title: { type: String }, // Optional
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Highlight', highlightSchema);