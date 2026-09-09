'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Create MenuStock join table for Many-to-Many relationship
    await queryInterface.createTable('MenuStocks', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      menu_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Menus',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      stock_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Stocks',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      quantity_needed: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Quantity of stock needed per menu portion',
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    // Add unique constraint to prevent duplicates
    await queryInterface.addConstraint('MenuStocks', {
      fields: ['menu_id', 'stock_id'],
      type: 'unique',
      name: 'unique_menu_stock',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('MenuStocks');
  }
};
