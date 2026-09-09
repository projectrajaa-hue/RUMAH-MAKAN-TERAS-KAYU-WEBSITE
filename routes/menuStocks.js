const express = require('express');
const router = express.Router();
const { MenuStock, Menu, Stock } = require('../models');
const auth = require('../middleware/auth');

// Get all menu stock relationships
router.get('/', auth, async (req, res) => {
  try {
    const menuStocks = await MenuStock.findAll({
      include: [
        { association: 'menu', attributes: ['id', 'name'] },
        { association: 'stock', attributes: ['id', 'name', 'unit'] }
      ]
    });

    res.json(menuStocks);
  } catch (error) {
    console.error('Error fetching menu stocks:', error);
    res.status(500).json({ error: 'Failed to fetch menu stocks' });
  }
});

// Get stock items for a specific menu
router.get('/menu/:menuId', auth, async (req, res) => {
  try {
    const { menuId } = req.params;

    const menuStocks = await MenuStock.findAll({
      where: { menu_id: menuId },
      include: [
        { association: 'stock', attributes: ['id', 'name', 'quantity', 'unit', 'minQuantity'] }
      ]
    });

    res.json(menuStocks);
  } catch (error) {
    console.error('Error fetching menu stocks:', error);
    res.status(500).json({ error: 'Failed to fetch menu stocks' });
  }
});

// Create menu stock relationship
router.post('/', auth, async (req, res) => {
  try {
    const { menu_id, stock_id, quantity_needed } = req.body;

    // Validate required fields
    if (!menu_id || !stock_id || !quantity_needed) {
      return res.status(400).json({ 
        error: 'menu_id, stock_id, and quantity_needed are required' 
      });
    }

    // Check if menu and stock exist
    const menu = await Menu.findByPk(menu_id);
    const stock = await Stock.findByPk(stock_id);

    if (!menu || !stock) {
      return res.status(404).json({ error: 'Menu or Stock not found' });
    }

    const menuStock = await MenuStock.create({
      menu_id,
      stock_id,
      quantity_needed: parseInt(quantity_needed),
    });

    const populated = await MenuStock.findByPk(menuStock.id, {
      include: [
        { association: 'menu', attributes: ['id', 'name'] },
        { association: 'stock', attributes: ['id', 'name', 'unit'] }
      ]
    });

    res.status(201).json(populated);
  } catch (error) {
    console.error('Error creating menu stock:', error);
    res.status(500).json({ error: 'Failed to create menu stock relationship' });
  }
});

// Update menu stock relationship
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity_needed } = req.body;

    const menuStock = await MenuStock.findByPk(id);

    if (!menuStock) {
      return res.status(404).json({ error: 'Menu stock relationship not found' });
    }

    await menuStock.update({ quantity_needed: parseInt(quantity_needed) });

    const updated = await MenuStock.findByPk(id, {
      include: [
        { association: 'menu', attributes: ['id', 'name'] },
        { association: 'stock', attributes: ['id', 'name', 'unit'] }
      ]
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating menu stock:', error);
    res.status(500).json({ error: 'Failed to update menu stock relationship' });
  }
});

// Delete menu stock relationship
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const menuStock = await MenuStock.findByPk(id);

    if (!menuStock) {
      return res.status(404).json({ error: 'Menu stock relationship not found' });
    }

    await menuStock.destroy();

    res.json({ message: 'Menu stock relationship deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu stock:', error);
    res.status(500).json({ error: 'Failed to delete menu stock relationship' });
  }
});

module.exports = router;
