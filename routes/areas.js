const express = require('express');
const router = express.Router();
const ServiceArea = require('../models/ServiceArea');
const { verifyAdmin } = require('../middleware/auth');

// GET all active areas (used in frontend dropdown)
router.get('/', async (req, res) => {
  try {
    const areas = await ServiceArea.find({ active: true }).sort({ name: 1 });
    res.json(areas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all areas including inactive (admin)
router.get('/all', verifyAdmin, async (req, res) => {
  try {
    const areas = await ServiceArea.find().sort({ name: 1 });
    res.json(areas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add area (admin)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const area = new ServiceArea(req.body);
    await area.save();
    res.status(201).json(area);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH toggle active (admin)
router.patch('/:id/toggle', verifyAdmin, async (req, res) => {
  try {
    const area = await ServiceArea.findById(req.params.id);
    if (!area) return res.status(404).json({ error: 'Area not found' });
    area.active = !area.active;
    await area.save();
    res.json(area);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE area (admin)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await ServiceArea.findByIdAndDelete(req.params.id);
    res.json({ message: 'Area deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
