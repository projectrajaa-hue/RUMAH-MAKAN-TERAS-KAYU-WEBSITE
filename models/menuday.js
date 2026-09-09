'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MenuDay extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      MenuDay.belongsTo(models.Menu, { 
        foreignKey: 'menu_id',
        as: 'Menu'
      });
    }
  }
  MenuDay.init({
    menu_id: DataTypes.INTEGER,
    day_of_week: DataTypes.INTEGER,
    is_active: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'MenuDay',
  });
  return MenuDay;
};