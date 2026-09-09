const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'warung_makan',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
  }
);

const Menu = require('./Menu')(sequelize);
const Stock = require('./Stock')(sequelize);
const Order = require('./Order')(sequelize);
const User = require('./User')(sequelize);
const MenuDay = require('./menuday')(sequelize, require('sequelize').DataTypes);
const MenuStock = require('./MenuStock')(sequelize);
const Settings = require('./Settings')(sequelize);

module.exports = {
  sequelize,
  Menu,
  Stock,
  Order,
  User,
  MenuDay,
  MenuStock,
  Settings,
};

// Run associations
Object.keys(module.exports).forEach(modelName => {
  if (module.exports[modelName].associate) {
    module.exports[modelName].associate(module.exports);
  }
});
