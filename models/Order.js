const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  name: String,
  price: Number,
  qty: Number,
});

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  area: { type: String, required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  restaurantName: { type: String },
  items: [orderItemSchema],
  totalPrice: { type: Number, required: true },
  deliveryCharge: { type: Number, default: 30 },
  appliedOffers: [{ title: String, discount: Number }],
  status: {
    type: String,
    enum: ['Placed', 'Preparing', 'Out for Delivery', 'Delivered'],
    default: 'Placed',
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
