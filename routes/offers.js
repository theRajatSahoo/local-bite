const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');
const { verifyAdmin } = require('../middleware/auth');

// GET offers (optionally filter by restaurantId, only active)
router.get('/', async (req, res) => {
  try {
    const filter = { active: true };
    if (req.query.restaurantId) {
      filter.$or = [
        { restaurantId: req.query.restaurantId },
        { restaurantId: null },
      ];
    }
    const now = new Date();
    const offers = await Offer.find(filter).sort({ createdAt: -1 });
    // Filter by validity dates client-side style
    const valid = offers.filter(o => {
      if (o.validFrom && now < new Date(o.validFrom)) return false;
      if (o.validUntil && now > new Date(o.validUntil)) return false;
      return true;
    });
    res.json(valid);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all offers (admin, no active filter)
router.get('/all', verifyAdmin, async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 }).populate('restaurantId', 'name');
    res.json(offers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create offer (admin)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const offer = new Offer(req.body);
    await offer.save();
    res.status(201).json(offer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update offer (admin)
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!offer) return res.status(404).json({ error: 'Offer not found' });
    res.json(offer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH toggle active (admin)
router.patch('/:id/toggle', verifyAdmin, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ error: 'Offer not found' });
    offer.active = !offer.active;
    await offer.save();
    res.json(offer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE offer (admin)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await Offer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Offer deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
