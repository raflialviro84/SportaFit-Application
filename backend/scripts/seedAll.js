// Script utama untuk menjalankan semua seeding data
const { resetAndSeedData } = require('./seedComprehensiveData');
const { seedBookings } = require('./seedBookings');

async function seedAllData() {
  try {
    console.log('🚀 MEMULAI SEEDING DATA LENGKAP');
    console.log('=====================================');
    
    // 1. Reset dan seed data dasar (users, arenas, courts, vouchers)
    console.log('\n📋 TAHAP 1: Seeding data dasar...');
    await resetAndSeedData();
    
    // 2. Seed bookings 1 tahun
    console.log('\n📋 TAHAP 2: Seeding bookings 1 tahun...');
    await seedBookings();
    
    console.log('\n🎉 SEEDING DATA LENGKAP SELESAI!');
    console.log('=====================================');
    console.log('✅ 50 Users dengan nama Indonesia');
    console.log('✅ 10 Arenas lengkap (termasuk Surabaya)');
    console.log('✅ Courts sesuai dengan arena masing-masing');
    console.log('✅ 4 Vouchers sesuai data asli');
    console.log('✅ ~1440 Bookings (120 per bulan selama 1 tahun)');
    console.log('\n📊 Silakan cek database Anda di phpMyAdmin!');
    
  } catch (error) {
    console.error('❌ Error dalam proses seeding:', error);
    throw error;
  }
}

// Jika script dipanggil langsung
if (require.main === module) {
  (async () => {
    try {
      await seedAllData();
      process.exit(0);
    } catch (error) {
      console.error('❌ Proses seeding gagal:', error);
      process.exit(1);
    }
  })();
}

module.exports = { seedAllData };
