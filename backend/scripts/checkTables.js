// Script untuk cek struktur tabel
const { Sequelize } = require('sequelize');
require('dotenv').config();

const db = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'badminton_reservation',
  logging: false
});

async function checkTables() {
  try {
    await db.authenticate();
    console.log('✅ Koneksi database berhasil');

    // Cek struktur tabel arenas
    console.log('\n📋 Struktur tabel arenas:');
    const [arenasColumns] = await db.query('DESCRIBE arenas');
    arenasColumns.forEach(col => {
      console.log(`  ${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
    });

    // Cek struktur tabel courts
    console.log('\n📋 Struktur tabel courts:');
    const [courtsColumns] = await db.query('DESCRIBE courts');
    courtsColumns.forEach(col => {
      console.log(`  ${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
    });

    // Cek struktur tabel bookings
    console.log('\n📋 Struktur tabel bookings:');
    const [bookingsColumns] = await db.query('DESCRIBE bookings');
    bookingsColumns.forEach(col => {
      console.log(`  ${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.close();
  }
}

checkTables();
