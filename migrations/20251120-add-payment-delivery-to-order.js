'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const table = await queryInterface.describeTable('Orders');
      
      if (!table.paymentMethod) {
        await queryInterface.addColumn('Orders', 'paymentMethod', {
          type: Sequelize.ENUM('cash', 'qris', 'transfer'),
          defaultValue: 'cash',
          allowNull: false,
        });
      }

      if (!table.deliveryMethod) {
        await queryInterface.addColumn('Orders', 'deliveryMethod', {
          type: Sequelize.ENUM('dine-in', 'pickup'),
          defaultValue: 'dine-in',
          allowNull: false,
        });
      }
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      const table = await queryInterface.describeTable('Orders');
      
      if (table.paymentMethod) {
        await queryInterface.removeColumn('Orders', 'paymentMethod');
      }

      if (table.deliveryMethod) {
        await queryInterface.removeColumn('Orders', 'deliveryMethod');
      }
    } catch (error) {
      console.error('Migration rollback error:', error);
      throw error;
    }
  }
};
