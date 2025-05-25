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
    }
  }
);

module.exports = sequelize;
