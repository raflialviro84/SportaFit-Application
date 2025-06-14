require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') }); // Memuat .env dari root folder proyek

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'badminton_reservation',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false // Ganti ke console.log jika ingin melihat query SQL
  },
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME_TEST || 'badminton_reservation_test',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  },
  production: {
    username: process.env.DB_USER_PROD,
    password: process.env.DB_PASSWORD_PROD,
    database: process.env.DB_NAME_PROD,
    host: process.env.DB_HOST_PROD,
    dialect: 'mysql',
    logging: false,
    pool: { 
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};
