const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Validasi input
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, dan password harus diisi' });
    }

    // Cek apakah user sudah terdaftar
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'Username sudah terdaftar' });
    }

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    // Buat user baru
    const newUser = await User.create({
      username,
      email,
      password, // Password akan di-hash oleh model
      role: 'user' // Default role untuk user yang mendaftar
    });

    res.status(201).json({
      message: 'Registrasi berhasil',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username, password } });
    // if (!user || !(await user.validPassword(password))) {
    //   return res.status(401).json({ message: 'Invalid credentials' });
    // }
    console.log('Login successful for user:', user.username);
    console.log('Signing token with secret:', process.env.JWT_SECRET ? '***SET***' : '***NOT SET***');
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    // Token is sent in response, stored in localStorage by frontend
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check auth
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out' });
});

module.exports = router;
