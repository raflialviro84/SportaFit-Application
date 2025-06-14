// server/db.js
const { Sequelize } = require("sequelize");
require("dotenv").config();

// Buat instance Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME || "badminton_reservation",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    logging: console.log, // Use console.log for logging, or false to disable
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    // Tambahkan retry logic untuk koneksi yang lebih stabil
    retry: {
      max: 3,
      timeout: 30000
    }
  }
);

// Fungsi untuk menguji koneksi database
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    console.error('Database connection details:');
    console.error(`  - Host: ${process.env.DB_HOST || 'localhost'}`);
    console.error(`  - Database: ${process.env.DB_NAME || 'badminton_reservation'}`);
    console.error(`  - User: ${process.env.DB_USER || 'root'}`);
    console.error(`  - Password: ${process.env.DB_PASSWORD ? '********' : 'Not set'}`);
    return false;
  }
};

// Export sequelize dan fungsi testConnection
module.exports = sequelize;
module.exports.testConnection = testConnection;
