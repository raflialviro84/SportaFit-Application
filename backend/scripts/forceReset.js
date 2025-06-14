// Script untuk force reset database dengan konfirmasi
const { Sequelize } = require('sequelize');
require('dotenv').config();

const db = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'badminton_reservation',
  logging: true // Enable logging untuk melihat query
});

async function forceReset() {
  try {
    console.log('🔄 FORCE RESET DATABASE');
    console.log(`📊 Target Database: ${process.env.DB_NAME || 'badminton_reservation'}`);
    console.log(`🏠 Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`👤 User: ${process.env.DB_USER || 'root'}`);
    
    await db.authenticate();
    console.log('✅ Koneksi database berhasil');

    // Tampilkan database yang sedang digunakan
    const [currentDb] = await db.query('SELECT DATABASE() as current_db');
    console.log(`🎯 Database aktif: ${currentDb[0].current_db}`);

    // Disable foreign key checks
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('🔓 Foreign key checks disabled');

    // Daftar tabel untuk direset
    const tables = ['user_vouchers', 'bookings', 'courts', 'arenas', 'vouchers', 'users'];

    console.log('\n🗑️ MENGHAPUS SEMUA DATA...');
    for (const table of tables) {
      try {
        // Cek jumlah data sebelum dihapus
        const [countBefore] = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`  📊 ${table}: ${countBefore[0].count} records sebelum dihapus`);
        
        // Hapus semua data
        await db.query(`DELETE FROM ${table}`);
        
        // Reset auto increment
        await db.query(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
        
        // Cek jumlah data setelah dihapus
        const [countAfter] = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`  ✅ ${table}: ${countAfter[0].count} records setelah dihapus`);
        
      } catch (error) {
        console.log(`  ⚠️ ${table}: ${error.message}`);
      }
    }

    // Enable foreign key checks
    await db.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('🔒 Foreign key checks enabled');

    console.log('\n✅ FORCE RESET SELESAI!');
    console.log('📝 Database sudah benar-benar kosong');
    console.log('🔄 Silakan refresh phpMyAdmin Anda');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.close();
  }
}

forceReset();
