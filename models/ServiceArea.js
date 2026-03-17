const mongoose = require('mongoose');

const serviceAreaSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('ServiceArea', serviceAreaSchema);
