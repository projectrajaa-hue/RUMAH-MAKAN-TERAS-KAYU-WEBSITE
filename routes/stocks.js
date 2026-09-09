const express = require('express');
const { Stock } = require('../models');
const router = express.Router();

// Get all stocks
router.get('/', async (req, res) => {
  try {
    const stocks = await Stock.findAll();
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create stock
router.post('/', async (req, res) => {
  try {
    const stock = await Stock.create(req.body);
    res.status(201).json(stock);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update stock
router.put('/:id', async (req, res) => {
  try {
    const stock = await Stock.findByPk(req.params.id);
    if (!stock) return res.status(404).json({ message: 'Stock not found' });
    await stock.update(req.body);
    res.json(stock);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete stock
router.delete('/:id', async (req, res) => {
  try {
    const stock = await Stock.findByPk(req.params.id);
    if (!stock) return res.status(404).json({ message: 'Stock not found' });
    await stock.destroy();
    res.json({ message: 'Stock deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
