const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', default: null },
  active: { type: Boolean, default: true },
  validFrom: { type: Date, default: null },
  validUntil: { type: Date, default: null },
  badgeColor: { type: String, default: '#e63946' },

  // Conditions (all optional)
  conditions: {
    daysOfWeek: { type: [Number], default: [] },          // 0=Sun,1=Mon,...,6=Sat
    minOrderAmount: { type: Number, default: null },
    requiredConsecutiveDays: { type: Number, default: null },
    applicableItemIds: { type: [mongoose.Schema.Types.ObjectId], default: [] },
    minItemQty: { type: Number, default: null },
  },

  // Reward (pick one)
  reward: {
    type: {
      type: String,
      enum: ['fixed_price', 'percentage_off', 'flat_off', 'free_item', 'custom_message'],
      required: true,
    },
    fixedPrice: { type: Number, default: null },
    percentageOff: { type: Number, default: null },
    flatOff: { type: Number, default: null },
    freeItemName: { type: String, default: '' },
    customMessage: { type: String, default: '' },
  },
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
