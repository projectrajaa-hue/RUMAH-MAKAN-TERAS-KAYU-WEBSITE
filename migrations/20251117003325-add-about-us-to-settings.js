'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Settings', 'about_us_title', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'Tentang Kami',
    });

    await queryInterface.addColumn('Settings', 'about_us_content', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('Settings', 'about_us_image', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Settings', 'vision', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('Settings', 'mission', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Settings', 'about_us_title');
    await queryInterface.removeColumn('Settings', 'about_us_content');
    await queryInterface.removeColumn('Settings', 'about_us_image');
    await queryInterface.removeColumn('Settings', 'vision');
    await queryInterface.removeColumn('Settings', 'mission');
  }
};
