const { sequelize, User, Menu, Stock } = require('./models');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function seed() {
  await sequelize.sync({ force: true }); // Reset database

  // Create admin user
  await User.create({
    username: 'admin',
    password: 'admin123',
    role: 'admin',
  });

  // Create sample menus
  await Menu.bulkCreate([
    {
      name: 'Nasi Gudeg',
      description: 'Nasi dengan gudeg khas Yogyakarta',
      price: 15000,
      image: 'https://example.com/gudeg.jpg',
      available: true,
    },
    {
      name: 'Ayam Bakar',
      description: 'Ayam bakar dengan bumbu rempah',
      price: 20000,
      image: 'https://example.com/ayam-bakar.jpg',
      available: true,
    },
    {
      name: 'Sate Ayam',
      description: 'Sate ayam dengan bumbu kacang',
      price: 18000,
      image: 'https://example.com/sate-ayam.jpg',
      available: true,
    },
  ]);

  // Create sample stocks
  await Stock.bulkCreate([
    {
      name: 'Beras',
      quantity: 50,
      unit: 'kg',
      minQuantity: 10,
    },
    {
      name: 'Ayam',
      quantity: 20,
      unit: 'kg',
      minQuantity: 5,
    },
    {
      name: 'Gudeg',
      quantity: 15,
      unit: 'kg',
      minQuantity: 3,
    },
  ]);

  console.log('Database seeded with sample data');
  process.exit();
}

seed();
