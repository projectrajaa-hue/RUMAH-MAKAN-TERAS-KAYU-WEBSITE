const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Stock = sequelize.define('Stock', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    minQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });

  Stock.associate = (models) => {
    Stock.belongsToMany(models.Menu, {
      through: models.MenuStock,
      foreignKey: 'stock_id',
      otherKey: 'menu_id',
      as: 'menus'
    });
  };

  return Stock;
};
