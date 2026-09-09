const express = require('express');
const { Order, Stock, Menu } = require('../models');
const { sendInvoice } = require('../services/emailService');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Configure multer for proof of payment upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'proof-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Helper function to deduct stock
const deductStock = async (items) => {
  try {
    for (const [menuId, quantity] of Object.entries(items)) {
      // Find menu to get associated stock
      const menu = await Menu.findByPk(menuId);
      if (menu) {
        // Find stock by menu name (assuming stock name matches menu name)
        const stock = await Stock.findOne({
          where: {
            name: menu.name,
          },
        });
        
        if (stock) {
          // Deduct quantity from stock
          await stock.update({
            quantity: Math.max(0, stock.quantity - parseInt(quantity)),
          });
        }
      }
    }
  } catch (error) {
    console.error('Error deducting stock:', error);
    throw error;
  }
};

// Public create order route
router.post('/', upload.single('proofOfPayment'), async (req, res) => {
  try {
    const items = JSON.parse(req.body.items);
    
    const orderData = {
      customerName: req.body.customerName,
      customerPhone: req.body.customerPhone,
      customerEmail: req.body.customerEmail,
      customerAddress: req.body.customerAddress,
      notes: req.body.notes,
      items: items,
      total: req.body.total,
      paymentMethod: req.body.paymentMethod || 'cash',
      deliveryMethod: req.body.deliveryMethod || 'dine-in',
      proofOfPayment: req.file ? `/uploads/${req.file.filename}` : null,
    };
    
    // Create order first
    const order = await Order.create(orderData);
    
    // Deduct stock after order is created successfully
    try {
      await deductStock(items);
    } catch (stockError) {
      console.error('Stock deduction warning (order still created):', stockError);
      // Don't fail the request if stock deduction fails
    }
    
    // Send invoice email asynchronously (non-blocking)
    if (order.customerEmail) {
      try {
        const menuIds = Object.keys(items).filter(key => !key.includes('_price')).map(Number);
        const menus = await Menu.findAll({
          where: { id: menuIds },
          attributes: ['id', 'name'],
        });
        sendInvoice(order, menus).catch(err => console.error('Email send error:', err));
      } catch (emailError) {
        console.error('Error preparing invoice email:', emailError);
      }
    }
    
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
