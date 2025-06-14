// Script untuk cek data yang ada di database
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

async function checkData() {
  try {
    await db.authenticate();
    console.log('✅ Koneksi database berhasil');
    console.log(`📊 Database: ${process.env.DB_NAME || 'badminton_reservation'}`);
    console.log(`🏠 Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`👤 User: ${process.env.DB_USER || 'root'}`);

    // Cek jumlah data di setiap tabel
    const tables = ['users', 'arenas', 'courts', 'vouchers', 'bookings'];
    
    console.log('\n📈 Jumlah data di setiap tabel:');
    for (const table of tables) {
      try {
        const [result] = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`  ${table}: ${result[0].count} records`);
      } catch (error) {
        console.log(`  ${table}: Tabel tidak ditemukan atau error`);
      }
    }

    // Tampilkan beberapa sample data
    console.log('\n👥 Sample Users:');
    try {
      const [users] = await db.query('SELECT id, name, email, role FROM users LIMIT 5');
      users.forEach(user => {
        console.log(`  ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.role}`);
      });
    } catch (error) {
      console.log('  Error mengambil data users');
    }

    console.log('\n🏟️ Sample Arenas:');
    try {
      const [arenas] = await db.query('SELECT id, name, city, rating FROM arenas LIMIT 5');
      arenas.forEach(arena => {
        console.log(`  ID: ${arena.id}, Name: ${arena.name}, City: ${arena.city}, Rating: ${arena.rating}`);
      });
    } catch (error) {
      console.log('  Error mengambil data arenas');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.close();
  }
}

checkData();
