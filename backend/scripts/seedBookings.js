// Script untuk membuat bookings 1 tahun (120 booking per bulan)
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

async function seedBookings() {
  try {
    console.log('📅 Memulai pembuatan bookings 1 tahun...');
    
    await db.authenticate();
    console.log('✅ Koneksi database berhasil');

    // Ambil data users dan courts
    const [usersResult] = await db.query('SELECT id FROM users WHERE role = "user"');
    const [courtsResult] = await db.query('SELECT id, arena_id, price_per_hour FROM courts');
    
    if (usersResult.length === 0 || courtsResult.length === 0) {
      throw new Error('Data users atau courts tidak ditemukan. Jalankan seedComprehensiveData.js terlebih dahulu.');
    }

    console.log(`👥 Ditemukan ${usersResult.length} users`);
    console.log(`🎾 Ditemukan ${courtsResult.length} courts`);

    let totalBookingsCreated = 0;
    const currentDate = new Date();
    
    // Buat bookings untuk 12 bulan terakhir (dari Januari 2024 hingga sekarang)
    for (let monthOffset = -11; monthOffset <= 0; monthOffset++) {
      const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + monthOffset, 1);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth();
      const monthName = targetDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      
      console.log(`📆 Membuat bookings untuk ${monthName}...`);
      
      // Buat 120 bookings untuk bulan ini
      let monthlyBookings = 0;
      
      for (let bookingNum = 0; bookingNum < 120; bookingNum++) {
        // Random tanggal dalam bulan tersebut
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const randomDay = Math.floor(Math.random() * daysInMonth) + 1;
        const bookingDate = new Date(year, month, randomDay);
        
        // Skip jika tanggal di masa depan
        if (bookingDate > currentDate) continue;
        
        // Random user dan court
        const randomUser = usersResult[Math.floor(Math.random() * usersResult.length)];
        const randomCourt = courtsResult[Math.floor(Math.random() * courtsResult.length)];
        
        // Random time slot (jam 6 pagi - 10 malam)
        const startHour = Math.floor(Math.random() * 16) + 6; // 6-21
        const duration = Math.floor(Math.random() * 3) + 1; // 1-3 jam
        const endHour = startHour + duration;
        
        // Pastikan tidak melebihi jam 23
        if (endHour > 23) continue;
        
        const startTime = `${startHour.toString().padStart(2, '0')}:00`;
        const endTime = `${endHour.toString().padStart(2, '0')}:00`;
        
        // Hitung total harga
        const totalPrice = randomCourt.price_per_hour * duration;
        const serviceFee = Math.floor(totalPrice * 0.05); // 5% service fee
        const finalTotal = totalPrice + serviceFee;
        
        // Random payment status (85% paid, 15% pending/unpaid)
        const paymentStatusRand = Math.random();
        let paymentStatus, bookingStatus;
        
        if (paymentStatusRand < 0.85) {
          paymentStatus = 'paid';
          bookingStatus = 'confirmed';
        } else if (paymentStatusRand < 0.95) {
          paymentStatus = 'unpaid';
          bookingStatus = 'pending';
        } else {
          paymentStatus = 'failed';
          bookingStatus = 'cancelled';
        }
        
        // Random payment method untuk yang paid
        const paymentMethods = ['credit_card', 'bank_transfer', 'e_wallet', 'qris'];
        const paymentMethod = paymentStatus === 'paid' ? 
          paymentMethods[Math.floor(Math.random() * paymentMethods.length)] : null;
        
        // Generate invoice number untuk yang paid
        const invoiceNumber = paymentStatus === 'paid' ? 
          `INV-${year}${(month + 1).toString().padStart(2, '0')}${randomDay.toString().padStart(2, '0')}-${(bookingNum + 1).toString().padStart(4, '0')}` : null;
        
        // Random activity
        const activities = ['Latihan Rutin', 'Sparring', 'Turnamen Kecil', 'Latihan Tim', 'Rekreasi'];
        const activity = activities[Math.floor(Math.random() * activities.length)];
        
        // Insert booking
        try {
          await db.query(`
            INSERT INTO bookings (
              user_id, court_id, arena_id, booking_date, start_time, end_time,
              total_price, service_fee, final_total_amount, payment_status, status,
              payment_method, invoice_number, activity, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, {
            replacements: [
              randomUser.id, randomCourt.id, randomCourt.arena_id,
              bookingDate.toISOString().split('T')[0], startTime, endTime,
              totalPrice, serviceFee, finalTotal, paymentStatus, bookingStatus,
              paymentMethod, invoiceNumber, activity, 
              new Date(bookingDate.getTime() + Math.random() * 24 * 60 * 60 * 1000), // Random created_at dalam hari yang sama
              new Date()
            ],
            type: db.QueryTypes.INSERT
          });
          
          monthlyBookings++;
          totalBookingsCreated++;
          
          // Progress indicator
          if (monthlyBookings % 20 === 0) {
            console.log(`   📊 ${monthlyBookings}/120 bookings untuk ${monthName}`);
          }
          
        } catch (error) {
          // Skip jika ada conflict (misal: double booking)
          continue;
        }
      }
      
      console.log(`   ✅ ${monthlyBookings} bookings berhasil dibuat untuk ${monthName}`);
    }
    
    console.log(`\n🎉 SELESAI! Total ${totalBookingsCreated} bookings berhasil dibuat`);
    
    // Tampilkan statistik
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_bookings,
        SUM(CASE WHEN payment_status = 'paid' THEN final_total_amount ELSE 0 END) as total_revenue,
        COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_bookings,
        COUNT(CASE WHEN payment_status = 'unpaid' THEN 1 END) as unpaid_bookings
      FROM bookings
    `);
    
    console.log('\n📊 STATISTIK BOOKINGS:');
    console.log(`📅 Total Bookings: ${stats[0].total_bookings}`);
    console.log(`💰 Total Revenue: Rp ${(stats[0].total_revenue || 0).toLocaleString('id-ID')}`);
    console.log(`✅ Paid Bookings: ${stats[0].paid_bookings}`);
    console.log(`⏳ Unpaid Bookings: ${stats[0].unpaid_bookings}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await db.close();
  }
}

// Jika script dipanggil langsung
if (require.main === module) {
  (async () => {
    try {
      await seedBookings();
      console.log('🎉 Seeding bookings selesai!');
      process.exit(0);
    } catch (error) {
      console.error('❌ Proses gagal:', error);
      process.exit(1);
    }
  })();
}

module.exports = { seedBookings };
