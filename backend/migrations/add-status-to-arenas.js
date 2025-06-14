// Migration to add status column to arenas table
const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Add status column to arenas table
      await queryInterface.addColumn('arenas', 'status', {
        type: DataTypes.ENUM('active', 'maintenance', 'inactive'),
        defaultValue: 'active',
        allowNull: false
      });
      
      console.log('Successfully added status column to arenas table');
    } catch (error) {
      console.error('Error adding status column:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Remove status column from arenas table
      await queryInterface.removeColumn('arenas', 'status');
      
      console.log('Successfully removed status column from arenas table');
    } catch (error) {
      console.error('Error removing status column:', error);
      throw error;
    }
  }
};
