const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Settings = sequelize.define('Settings', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    restaurant_name: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Warung Ibu Tami',
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    whatsapp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bank_account: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    qris_image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    business_hours: {
      type: DataTypes.JSON,
      defaultValue: {
        monday: { open: '09:00', close: '17:00', closed: false },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        wednesday: { open: '09:00', close: '17:00', closed: false },
        thursday: { open: '09:00', close: '17:00', closed: false },
        friday: { open: '09:00', close: '17:00', closed: false },
        saturday: { open: '09:00', close: '17:00', closed: false },
        sunday: { open: '09:00', close: '17:00', closed: false },
      },
    },
    logo_image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    about_us_title: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Tentang Kami',
    },
    about_us_content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    about_us_image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    vision: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    mission: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'Settings',
  });

  return Settings;
};
