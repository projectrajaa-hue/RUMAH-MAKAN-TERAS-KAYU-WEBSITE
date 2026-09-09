const express = require('express');
const { Order, Stock, Menu } = require('../models');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const { sendInvoice } = require('../services/emailService');
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

// Get all orders
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let whereClause = {};

    // Filter by date range if provided
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        whereClause.createdAt[Op.gte] = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.createdAt[Op.lte] = end;
      }
    }

    const orders = await Order.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    // Ensure total is a number, not a string
    const ordersWithNumbers = orders.map(order => ({
      ...order.toJSON?.() || order,
      total: parseFloat(order.total) || 0
    }));
    res.json(ordersWithNumbers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get order detail by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Get menu details for items
    let menuDetails = [];
    if (order.items && typeof order.items === 'object') {
      const menuIds = Array.isArray(order.items) 
        ? order.items.map(item => item.menuId || item.id).filter(id => id)
        : Object.keys(order.items).filter(key => !isNaN(key));
      
      if (menuIds.length > 0) {
        menuDetails = await Menu.findAll({
          where: {
            id: {
              [Op.in]: menuIds
            }
          }
        });
      }
    }

    // Format response with menu details
    const orderDetail = {
      ...order.toJSON?.() || order,
      total: parseFloat(order.total) || 0,
      menuDetails: menuDetails,
      itemsWithDetails: Array.isArray(order.items) 
        ? order.items.map(item => {
            const menu = menuDetails.find(m => m.id === (item.menuId || item.id));
            return {
              ...item,
              menuName: menu?.name || 'Unknown',
              menuPrice: menu?.price || 0
            };
          })
        : Object.entries(order.items).map(([menuId, quantity]) => {
            const menu = menuDetails.find(m => m.id === parseInt(menuId));
            return {
              menuId: parseInt(menuId),
              quantity: quantity,
              menuName: menu?.name || 'Unknown',
              menuPrice: menu?.price || 0,
              subtotal: (menu?.price || 0) * quantity
            };
          })
    };

    res.json(orderDetail);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get chart data - Revenue & Orders Trend
router.get('/charts/trend', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let whereClause = {};

    // Filter by date range if provided
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        whereClause.createdAt[Op.gte] = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.createdAt[Op.lte] = end;
      }
    }

    const orders = await Order.findAll({
      where: whereClause,
      attributes: ['id', 'total', 'items', 'createdAt'],
      order: [['createdAt', 'ASC']]
    });

    // Group orders by date
    const chartData = {};
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      
      if (!chartData[date]) {
        chartData[date] = {
          date,
          revenue: 0,
          orders: 0,
          transactions: 0,
          itemsCount: 0
        };
      }

      const total = parseFloat(order.total) || 0;
      chartData[date].revenue += total;
      chartData[date].transactions += 1;

      // Count total items
      if (order.items && typeof order.items === 'object') {
        const itemsArray = Array.isArray(order.items) ? order.items : Object.values(order.items);
        chartData[date].itemsCount += itemsArray.reduce((sum, item) => {
          return sum + (typeof item === 'number' ? item : (item.quantity || 0));
        }, 0);
      }

      chartData[date].orders = Object.keys(order.items || {}).length;
    });

    // Convert to array and sort
    const result = Object.values(chartData).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    res.json(result);
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create order
router.post('/', upload.single('proofOfPayment'), async (req, res) => {
  try {
    const items = JSON.parse(req.body.items);
    
    const orderData = {
      customerName: req.body.customerName,
      customerPhone: req.body.customerPhone,
      customerEmail: req.body.customerEmail, // Add email support
      customerAddress: req.body.customerAddress,
      notes: req.body.notes,
      items: items,
      total: req.body.total,
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
    
    // Send order confirmation email if email provided
    if (order.customerEmail) {
      console.log(`[EMAIL] Preparing order confirmation email for order #${order.id}`);
      
      // Get menu details for the email
      let menuData = [];
      if (order.items && typeof order.items === 'object') {
        const menuIds = Array.isArray(order.items) 
          ? order.items.map(item => item.menuId || item.id).filter(id => id)
          : Object.keys(order.items).filter(key => !isNaN(key));
        
        if (menuIds.length > 0) {
          menuData = await Menu.findAll({
            where: {
              id: {
                [Op.in]: menuIds
              }
            }
          });
        }
      }
      
      // Send order confirmation email
      const emailSent = await sendInvoice(order, menuData);
      
      if (emailSent) {
        console.log(`[EMAIL] ✅ Order confirmation email sent successfully for order #${order.id}`);
      } else {
        console.log(`[EMAIL] ⚠️ Failed to send order confirmation email for order #${order.id}`);
      }
    }
    
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update order status
router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    const oldStatus = order.status;
    await order.update(req.body);
    
    // Get menu details for email (used for both confirmed and completed)
    let menuData = [];
    if (order.items && typeof order.items === 'object') {
      const menuIds = Array.isArray(order.items) 
        ? order.items.map(item => item.menuId || item.id).filter(id => id)
        : Object.keys(order.items).filter(key => !isNaN(key));
      
      if (menuIds.length > 0) {
        menuData = await Menu.findAll({
          where: {
            id: {
              [Op.in]: menuIds
            }
          }
        });
      }
    }

    // Send email based on status change
    if (oldStatus !== 'confirmed' && req.body.status === 'confirmed') {
      // Send invoice email when payment is confirmed
      console.log(`[EMAIL] Preparing invoice email for order #${order.id}`);
      const emailSent = await sendInvoice(order, menuData);
      
      if (emailSent) {
        console.log(`[EMAIL] ✅ Invoice email sent successfully for order #${order.id}`);
      } else {
        console.log(`[EMAIL] ⚠️ Failed to send invoice email for order #${order.id}`);
      }
    } 
    else if (oldStatus !== 'completed' && req.body.status === 'completed') {
      // Send completion email when order is completed
      console.log(`[EMAIL] Preparing completion email for order #${order.id}`);
      const emailSent = await sendInvoice(order, menuData);
      
      if (emailSent) {
        console.log(`[EMAIL] ✅ Completion email sent successfully for order #${order.id}`);
      } else {
        console.log(`[EMAIL] ⚠️ Failed to send completion email for order #${order.id}`);
      }
    }
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Resend invoice email
router.post('/:id/resend-invoice', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    if (!order.customerEmail) {
      return res.status(400).json({ 
        message: 'Customer email is not available for this order' 
      });
    }

    // Get menu details for the email
    let menuData = [];
    if (order.items && typeof order.items === 'object') {
      const menuIds = Array.isArray(order.items) 
        ? order.items.map(item => item.menuId || item.id).filter(id => id)
        : Object.keys(order.items).filter(key => !isNaN(key));
      
      if (menuIds.length > 0) {
        menuData = await Menu.findAll({
          where: {
            id: {
              [Op.in]: menuIds
            }
          }
        });
      }
    }

    // Send invoice email
    console.log(`[EMAIL] Resending invoice email for order #${order.id} to ${order.customerEmail}`);
    const emailSent = await sendInvoice(order, menuData);

    if (emailSent) {
      console.log(`[EMAIL] ✅ Invoice email resent successfully for order #${order.id}`);
      res.json({ 
        success: true,
        message: 'Invoice email resent successfully',
        order 
      });
    } else {
      console.log(`[EMAIL] ⚠️ Failed to resend invoice email for order #${order.id}`);
      res.status(500).json({ 
        message: 'Failed to send invoice email. Please try again later.' 
      });
    }
  } catch (error) {
    console.error('Error resending invoice:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
