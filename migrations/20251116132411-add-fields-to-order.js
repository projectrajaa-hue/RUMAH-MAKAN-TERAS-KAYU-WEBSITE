'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Orders', 'customerAddress', {
      type: Sequelize.TEXT,
      allowNull: false,
    });
    await queryInterface.addColumn('Orders', 'notes', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('Orders', 'proofOfPayment', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Orders', 'customerAddress');
    await queryInterface.removeColumn('Orders', 'notes');
    await queryInterface.removeColumn('Orders', 'proofOfPayment');
  }
};
