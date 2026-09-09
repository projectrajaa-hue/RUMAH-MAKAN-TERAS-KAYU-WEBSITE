'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Orders', 'customerEmail', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'customerPhone',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Orders', 'customerEmail');
  },
};
