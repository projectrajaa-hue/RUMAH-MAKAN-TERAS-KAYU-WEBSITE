const express = require('express');
const router = express.Router();
const { Settings } = require('../models');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for settings uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'setting-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Get settings (public route)
router.get('/', async (req, res) => {
  try {
    const settings = await Settings.findOne();
    
    if (!settings) {
      // Return default settings if none exist
      return res.json({
        id: null,
        restaurant_name: 'Warung Ibu Tami',
        address: '',
        latitude: null,
        longitude: null,
        phone: '',
        whatsapp: '',
        email: '',
        bank_account: '',
        qris_image: null,
        description: '',
        business_hours: {
          monday: { open: '09:00', close: '17:00', closed: false },
          tuesday: { open: '09:00', close: '17:00', closed: false },
          wednesday: { open: '09:00', close: '17:00', closed: false },
          thursday: { open: '09:00', close: '17:00', closed: false },
          friday: { open: '09:00', close: '17:00', closed: false },
          saturday: { open: '09:00', close: '17:00', closed: false },
          sunday: { open: '09:00', close: '17:00', closed: false },
        },
        logo_image: null,
      });
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update settings (protected route)
router.put('/', auth, upload.fields([
  { name: 'qris_image', maxCount: 1 },
  { name: 'logo_image', maxCount: 1 },
  { name: 'about_us_image', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('PUT /settings request body:', req.body);
    console.log('PUT /settings files:', req.files);

    const {
      restaurant_name,
      address,
      latitude,
      longitude,
      phone,
      whatsapp,
      email,
      bank_account,
      description,
      business_hours,
      about_us_title,
      about_us_content,
      vision,
      mission,
    } = req.body;

    let settings = await Settings.findOne();

    const updateData = {
      restaurant_name,
      address,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      phone,
      whatsapp,
      email,
      bank_account,
      description,
      about_us_title,
      about_us_content,
      vision,
      mission,
      business_hours: business_hours ? JSON.parse(business_hours) : undefined,
    };

    // Handle file uploads - preserve existing files if not updated
    if (req.files?.qris_image) {
      updateData.qris_image = '/uploads/' + req.files.qris_image[0].filename;
    } else if (settings?.qris_image) {
      // Keep existing qris_image if no new file uploaded
      updateData.qris_image = settings.qris_image;
    }

    if (req.files?.logo_image) {
      updateData.logo_image = '/uploads/' + req.files.logo_image[0].filename;
    } else if (settings?.logo_image) {
      // Keep existing logo_image if no new file uploaded
      updateData.logo_image = settings.logo_image;
    }

    if (req.files?.about_us_image) {
      updateData.about_us_image = '/uploads/' + req.files.about_us_image[0].filename;
    } else if (settings?.about_us_image) {
      // Keep existing about_us_image if no new file uploaded
      updateData.about_us_image = settings.about_us_image;
    }

    console.log('Update data:', updateData);

    if (!settings) {
      // Create new settings if doesn't exist
      settings = await Settings.create(updateData);
    } else {
      // Update existing settings
      await settings.update(updateData);
    }

    console.log('Settings after update:', settings);
    console.log('Settings qris_image:', settings.qris_image);
    console.log('Settings dataValues:', settings.dataValues);

    // Ensure we send the serialized data
    const settingsData = settings.toJSON ? settings.toJSON() : settings;
    console.log('Settings data to send:', settingsData);

    res.json({
      message: 'Settings updated successfully',
      settings: settingsData,
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings', details: error.message });
  }
});

// Create settings (admin only - for initial setup)
router.post('/', auth, upload.fields([
  { name: 'qris_image', maxCount: 1 },
  { name: 'logo_image', maxCount: 1 },
  { name: 'about_us_image', maxCount: 1 }
]), async (req, res) => {
  try {
    const existingSettings = await Settings.findOne();
    
    if (existingSettings) {
      return res.status(400).json({ error: 'Settings already exist. Use PUT to update.' });
    }

    const {
      restaurant_name,
      address,
      latitude,
      longitude,
      phone,
      whatsapp,
      email,
      bank_account,
      description,
      business_hours,
      about_us_title,
      about_us_content,
      vision,
      mission,
    } = req.body;

    const createData = {
      restaurant_name,
      address,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      phone,
      whatsapp,
      email,
      bank_account,
      description,
      about_us_title,
      about_us_content,
      vision,
      mission,
      business_hours: business_hours ? JSON.parse(business_hours) : undefined,
    };

    // Handle file uploads
    if (req.files?.qris_image) {
      createData.qris_image = '/uploads/' + req.files.qris_image[0].filename;
    }

    if (req.files?.logo_image) {
      createData.logo_image = '/uploads/' + req.files.logo_image[0].filename;
    }

    if (req.files?.about_us_image) {
      createData.about_us_image = '/uploads/' + req.files.about_us_image[0].filename;
    }

    const settings = await Settings.create(createData);

    const settingsData = settings.toJSON ? settings.toJSON() : settings;

    res.status(201).json({
      message: 'Settings created successfully',
      settings: settingsData,
    });
  } catch (error) {
    console.error('Error creating settings:', error);
    res.status(500).json({ error: 'Failed to create settings' });
  }
});

module.exports = router;
