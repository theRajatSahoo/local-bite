const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  area: { type: String, required: true },
  category: { type: String, default: 'Multi-cuisine' },
  imageUrl: { type: String, default: '' },
  isOpen: { type: Boolean, default: true },
  rating: { type: Number, default: 4.0, min: 1, max: 5 },
  deliveryTime: { type: String, default: '30-45 min' },
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
