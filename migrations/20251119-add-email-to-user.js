'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Check if email column already exists
      const table = await queryInterface.describeTable('Users');
      if (!table.email) {
        await queryInterface.addColumn(
          'Users',
          'email',
          {
            type: Sequelize.STRING,
            allowNull: true,
            unique: true,
          },
          { transaction }
        );
      }

      // Update role enum to include 'user'
      try {
        await queryInterface.changeColumn(
          'Users',
          'role',
          {
            type: Sequelize.ENUM('admin', 'staff', 'user'),
            defaultValue: 'staff',
            allowNull: false,
          },
          { transaction }
        );
      } catch (err) {
        console.log('Role column already has user value or other update occurred');
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Remove email column
      const table = await queryInterface.describeTable('Users');
      if (table.email) {
        await queryInterface.removeColumn('Users', 'email', { transaction });
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
