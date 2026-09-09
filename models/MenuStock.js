const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MenuStock = sequelize.define('MenuStock', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    menu_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Menus',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    stock_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Stocks',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    quantity_needed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  }, {
    tableName: 'MenuStocks',
  });

  MenuStock.associate = (models) => {
    MenuStock.belongsTo(models.Menu, { 
      foreignKey: 'menu_id',
      as: 'menu'
    });
    MenuStock.belongsTo(models.Stock, { 
      foreignKey: 'stock_id',
      as: 'stock'
    });
  };

  return MenuStock;
};
