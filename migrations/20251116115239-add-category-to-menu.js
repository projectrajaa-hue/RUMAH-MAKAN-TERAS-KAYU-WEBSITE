'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Menus', 'category', {
      type: Sequelize.ENUM('prasmanan', 'catering'),
      allowNull: false,
      defaultValue: 'prasmanan',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Menus', 'category');
  }
};
