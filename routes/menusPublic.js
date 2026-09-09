const express = require('express');
const { Menu, MenuDay } = require('../models');
const router = express.Router();

// Root handler - returns all prasmanan menus
router.get('/', async (req, res) => {
  try {
    const menus = await Menu.findAll({
      where: { category: 'prasmanan' },
      include: [{
        model: MenuDay,
        as: 'MenuDays'
      }]
    });
    res.json(menus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Public route for /api/menus/today
router.get('/today', async (req, res) => {
  try {
    const today = new Date().getDay();
    const dayOfWeek = today === 0 ? 7 : today;

    let menus = await Menu.findAll({
      include: [{
        model: MenuDay,
        as: 'MenuDays'
      }],
      where: { category: 'prasmanan' }
    });

    menus = menus.filter(menu => 
      menu.MenuDays && menu.MenuDays.some(md => md.day_of_week === dayOfWeek && md.is_active)
    );

    if (menus.length === 0) {
      const prevDay = dayOfWeek === 1 ? 7 : dayOfWeek - 1;
      menus = await Menu.findAll({
        include: [{
          model: MenuDay,
          as: 'MenuDays'
        }],
        where: { category: 'prasmanan' }
      });
      menus = menus.filter(menu => 
        menu.MenuDays && menu.MenuDays.some(md => md.day_of_week === prevDay && md.is_active)
      );
    }

    res.json(menus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Public catering menu route - available for customers
router.get('/catering', async (req, res) => {
  try {
    const menus = await Menu.findAll({
      where: { category: 'catering' }
    });
    res.json(menus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get menus by ids (public)
router.get('/bulk', async (req, res) => {
  try {
    const ids = req.query.ids ? req.query.ids.split(',').map(id => parseInt(id)) : [];
    if (ids.length === 0) {
      return res.json([]);
    }
    const menus = await Menu.findAll({
      where: { id: ids },
      include: [{
        model: MenuDay,
        as: 'MenuDays'
      }]
    });
    res.json(menus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
