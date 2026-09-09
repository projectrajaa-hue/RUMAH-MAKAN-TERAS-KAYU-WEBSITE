'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Orders', 'items', {
      type: Sequelize.JSON,
      allowNull: false,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Orders', 'items', {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  }
};
