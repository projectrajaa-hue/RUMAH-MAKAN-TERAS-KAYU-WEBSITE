const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Menu = sequelize.define('Menu', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
    },
    available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    category: {
      type: DataTypes.ENUM('prasmanan', 'catering'),
      allowNull: false,
      defaultValue: 'prasmanan',
    },
  }, {
    // paranoid: true, // Enable soft delete - removed to avoid deletedAt column issue
  });

  Menu.associate = (models) => {
    Menu.hasMany(models.MenuDay, { 
      foreignKey: 'menu_id', 
      as: 'MenuDays' 
    });
    Menu.belongsToMany(models.Stock, {
      through: models.MenuStock,
      foreignKey: 'menu_id',
      otherKey: 'stock_id',
      as: 'stocks'
    });
  };

  return Menu;
};
