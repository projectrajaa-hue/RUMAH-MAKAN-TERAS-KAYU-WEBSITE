const express = require('express');
const { Menu, MenuDay, sequelize } = require('../models');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Get all menus
router.get('/', async (req, res) => {
  try {
    const menus = await Menu.findAll({
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

// Create menu
router.post('/', upload.single('image'), async (req, res) => {
  try {
    let menu;
    if (req.body.editingId) {
      menu = await Menu.findByPk(req.body.editingId);
      await menu.update({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        available: req.body.available,
        category: req.body.category,
        image: req.file ? `/uploads/${req.file.filename}` : menu.image
      });
    } else {
      menu = await Menu.create({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        available: req.body.available,
        category: req.body.category,
        image: req.file ? `/uploads/${req.file.filename}` : null
      });
    }

    // Update MenuDays
    if (req.body.category !== 'catering') {
      await MenuDay.destroy({ where: { menu_id: menu.id } }); // Remove old
      if (req.body.selectedDays) {
        for (const day of req.body.selectedDays) {
          await MenuDay.create({
            menu_id: menu.id,
            day_of_week: day,
            is_active: true
          });
        }
      }
    }

    res.status(201).json(menu);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update menu
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const menu = await Menu.findByPk(req.params.id);
    if (!menu) return res.status(404).json({ message: 'Menu not found' });
    const menuData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      available: req.body.available,
      category: req.body.category,
      image: req.file ? `/uploads/${req.file.filename}` : menu.image
    };
    await menu.update(menuData);

    // Update MenuDays
    if (req.body.category !== 'catering') {
      await MenuDay.destroy({ where: { menu_id: menu.id } }); // Remove old
      if (req.body.selectedDays) {
        for (const day of req.body.selectedDays) {
          await MenuDay.create({
            menu_id: menu.id,
            day_of_week: day,
            is_active: true
          });
        }
      }
    }

    res.json(menu);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete menu
router.delete('/:id', async (req, res) => {
  try {
    const menu = await Menu.findByPk(req.params.id);
    if (!menu) return res.status(404).json({ message: 'Menu not found' });
    await MenuDay.destroy({ where: { menu_id: menu.id } });
    await menu.destroy();
    res.json({ message: 'Menu deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete menu schedule (all MenuDays)
router.delete('/:id/schedule', async (req, res) => {
  try {
    await MenuDay.destroy({ where: { menu_id: req.params.id } });
    res.json({ message: 'Schedule deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add menu schedule (single day)
router.post('/:id/schedule', async (req, res) => {
  try {
    const { day_of_week, is_active } = req.body;
    const menuId = req.params.id;

    // Check if schedule exists
    let schedule = await MenuDay.findOne({
      where: { menu_id: menuId, day_of_week }
    });

    if (schedule) {
      await schedule.update({ is_active });
    } else {
      schedule = await MenuDay.create({
        menu_id: menuId,
        day_of_week,
        is_active
      });
    }

    res.status(201).json(schedule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get today's menus with fallback to previous day
router.get('/today', async (req, res) => {
  try {
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayOfWeek = today === 0 ? 7 : today; // Convert to 1-7, 7=Sunday

    // Try to get menus for today
    let menus = await Menu.findAll({
      include: [{
        model: MenuDay,
        as: 'MenuDays'
      }],
      where: { category: 'prasmanan' }
    });

    // Filter menus that have MenuDays for today
    menus = menus.filter(menu => 
      menu.MenuDays && menu.MenuDays.some(md => md.day_of_week === dayOfWeek && md.is_active)
    );

    // If no menus for today, get from previous day
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

module.exports = router;
