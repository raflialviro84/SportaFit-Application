// Script untuk reset database dan mengisi dengan data baru yang lengkap
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Setup database connection
const db = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'badminton_reservation',
  logging: false
});

async function resetDatabase() {
  try {
    console.log('🔄 Memulai reset database...');
    
    // Test koneksi database
    await db.authenticate();
    console.log('✅ Koneksi database berhasil');

    // Disable foreign key checks untuk menghindari error saat delete
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('🔓 Foreign key checks disabled');

    // Daftar tabel yang akan direset (urutan penting karena foreign key)
    const tablesToReset = [
      'user_vouchers',
      'bookings', 
      'courts',
      'arenas',
      'vouchers',
      'users'
    ];

    // Hapus semua data dari tabel
    console.log('🗑️ Menghapus semua data...');
    for (const table of tablesToReset) {
      try {
        await db.query(`DELETE FROM ${table}`);
        await db.query(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
        console.log(`   ✅ Tabel ${table} berhasil direset`);
      } catch (error) {
        console.log(`   ⚠️ Tabel ${table} tidak ditemukan atau sudah kosong`);
      }
    }

    // Enable foreign key checks kembali
    await db.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('🔒 Foreign key checks enabled');

    console.log('✅ Database berhasil direset!');
    console.log('📝 Siap untuk diisi dengan data baru');

  } catch (error) {
    console.error('❌ Error saat reset database:', error);
    throw error;
  }
}

// Fungsi untuk mengisi data baru yang lengkap
async function seedNewData() {
  try {
    console.log('🌱 Memulai seeding data baru...');

    // 1. Insert Users dengan data yang lebih lengkap
    console.log('👥 Membuat users...');
    const users = [
      {
        name: 'Admin SportaFit',
        email: 'admin@sportafit.com',
        password: '$2b$10$dummy.hash.for.admin.account.only',
        phone: '081234567890',
        birth_date: '1990-01-15',
        role: 'admin',
        created_at: new Date()
      },
      {
        name: 'Budi Santoso',
        email: 'budi.santoso@gmail.com', 
        password: '$2b$10$dummy.hash.for.testing.purposes.only',
        phone: '081234567891',
        birth_date: '1985-03-20',
        role: 'user',
        created_at: new Date()
      },
      {
        name: 'Siti Nurhaliza',
        email: 'siti.nurhaliza@gmail.com',
        password: '$2b$10$dummy.hash.for.testing.purposes.only', 
        phone: '081234567892',
        birth_date: '1992-07-10',
        role: 'user',
        created_at: new Date()
      },
      {
        name: 'Ahmad Wijaya',
        email: 'ahmad.wijaya@gmail.com',
        password: '$2b$10$dummy.hash.for.testing.purposes.only',
        phone: '081234567893', 
        birth_date: '1988-11-25',
        role: 'user',
        created_at: new Date()
      },
      {
        name: 'Dewi Lestari',
        email: 'dewi.lestari@gmail.com',
        password: '$2b$10$dummy.hash.for.testing.purposes.only',
        phone: '081234567894',
        birth_date: '1995-05-18',
        role: 'user', 
        created_at: new Date()
      }
    ];

    for (const user of users) {
      await db.query(`
        INSERT INTO users (name, email, password, phone, birth_date, role, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, {
        replacements: [user.name, user.email, user.password, user.phone, user.birth_date, user.role, user.created_at],
        type: db.QueryTypes.INSERT
      });
    }
    console.log(`   ✅ ${users.length} users berhasil dibuat`);

    // 2. Insert Arenas dengan data lengkap
    console.log('🏟️ Membuat arenas...');
    const arenas = [
      {
        name: 'SportaFit Arena Central Jakarta',
        address: 'Jl. Sudirman No. 123, Senayan',
        city: 'Jakarta Pusat',
        category: 'Badminton',
        description: 'Arena badminton premium di pusat kota Jakarta dengan fasilitas terlengkap. Dilengkapi dengan AC, sound system, dan pencahayaan LED berkualitas tinggi.',
        price_per_hour: 80000,
        rating: 4.8,
        reviews_count: 125,
        images: JSON.stringify(['/arena-central-1.jpg', '/arena-central-2.jpg', '/arena-central-3.jpg']),
        facilities: JSON.stringify(['AC', 'Parkir Luas', 'Kantin', 'Mushola', 'Locker Room', 'Sound System', 'LED Lighting']),
        opening_hours: '06:00-24:00',
        created_at: new Date()
      },
      {
        name: 'SportaFit Arena Kelapa Gading',
        address: 'Jl. Boulevard Raya No. 456, Kelapa Gading',
        city: 'Jakarta Utara',
        category: 'Badminton',
        description: 'Arena badminton modern di kawasan Kelapa Gading dengan standar internasional. Cocok untuk turnamen dan latihan profesional.',
        price_per_hour: 70000,
        rating: 4.6,
        reviews_count: 98,
        images: JSON.stringify(['/arena-gading-1.jpg', '/arena-gading-2.jpg']),
        facilities: JSON.stringify(['AC', 'Parkir', 'Kantin', 'Mushola', 'Pro Shop', 'Spectator Area']),
        opening_hours: '07:00-23:00',
        created_at: new Date()
      },
      {
        name: 'SportaFit Arena BSD',
        address: 'Jl. BSD Raya No. 789, Serpong',
        city: 'Tangerang Selatan',
        category: 'Badminton',
        description: 'Arena badminton terbaru di BSD dengan konsep eco-friendly. Menggunakan teknologi ramah lingkungan dan ventilasi alami.',
        price_per_hour: 60000,
        rating: 4.7,
        reviews_count: 87,
        images: JSON.stringify(['/arena-bsd-1.jpg', '/arena-bsd-2.jpg', '/arena-bsd-3.jpg']),
        facilities: JSON.stringify(['AC', 'Parkir', 'Kantin Organic', 'Mushola', 'Kids Area', 'Eco Locker']),
        opening_hours: '06:00-22:00',
        created_at: new Date()
      }
    ];

    for (const arena of arenas) {
      await db.query(`
        INSERT INTO arenas (name, address, city, category, description, price_per_hour, rating, reviews_count, images, facilities, opening_hours, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, {
        replacements: [arena.name, arena.address, arena.city, arena.category, arena.description, arena.price_per_hour, arena.rating, arena.reviews_count, arena.images, arena.facilities, arena.opening_hours, arena.created_at],
        type: db.QueryTypes.INSERT
      });
    }
    console.log(`   ✅ ${arenas.length} arenas berhasil dibuat`);

    // 3. Insert Courts untuk setiap arena
    console.log('🎾 Membuat courts...');
    const [arenasResult] = await db.query('SELECT id FROM arenas ORDER BY id');
    let courtCount = 0;

    for (const arena of arenasResult) {
      // Setiap arena memiliki 4-6 courts
      const numCourts = Math.floor(Math.random() * 3) + 4; // 4-6 courts

      for (let i = 1; i <= numCourts; i++) {
        await db.query(`
          INSERT INTO courts (arena_id, name, type, price_per_hour, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `, {
          replacements: [
            arena.id,
            `Court ${i}`,
            'Standard',
            50000 + (Math.floor(Math.random() * 5) * 10000), // 50k-90k
            'active',
            new Date()
          ],
          type: db.QueryTypes.INSERT
        });
        courtCount++;
      }
    }
    console.log(`   ✅ ${courtCount} courts berhasil dibuat`);

    // 4. Insert Vouchers dengan data lengkap
    console.log('🎫 Membuat vouchers...');
    const vouchers = [
      {
        code: 'WELCOME25',
        title: 'Selamat Datang - Diskon 25%',
        description: 'Dapatkan diskon 25% untuk pemesanan pertama Anda! Berlaku untuk semua arena SportaFit.',
        discount_type: 'percentage',
        discount_value: 25.00,
        min_purchase: 100000.00,
        max_discount: 50000.00,
        start_date: '2024-01-01 00:00:00',
        end_date: '2025-12-31 23:59:59',
        image_url: '/voucher-welcome.png',
        is_active: true,
        usage_limit: 1000,
        usage_count: 0
      },
      {
        code: 'WEEKEND50',
        title: 'Weekend Special - Diskon 50%',
        description: 'Diskon khusus weekend! Hemat hingga 50% untuk booking di hari Sabtu dan Minggu.',
        discount_type: 'percentage',
        discount_value: 50.00,
        min_purchase: 150000.00,
        max_discount: 75000.00,
        start_date: '2024-01-01 00:00:00',
        end_date: '2025-06-30 23:59:59',
        image_url: '/voucher-weekend.png',
        is_active: true,
        usage_limit: 500,
        usage_count: 0
      },
      {
        code: 'STUDENT20',
        title: 'Diskon Pelajar 20%',
        description: 'Khusus untuk pelajar dan mahasiswa! Tunjukkan kartu pelajar untuk mendapat diskon 20%.',
        discount_type: 'percentage',
        discount_value: 20.00,
        min_purchase: 75000.00,
        max_discount: 30000.00,
        start_date: '2024-01-01 00:00:00',
        end_date: '2025-12-31 23:59:59',
        image_url: '/voucher-student.png',
        is_active: true,
        usage_limit: 200,
        usage_count: 0
      },
      {
        code: 'CASHBACK30K',
        title: 'Cashback Rp 30.000',
        description: 'Dapatkan cashback langsung Rp 30.000 untuk pemesanan minimal Rp 200.000.',
        discount_type: 'fixed',
        discount_value: 30000.00,
        min_purchase: 200000.00,
        max_discount: null,
        start_date: '2024-01-01 00:00:00',
        end_date: '2025-08-31 23:59:59',
        image_url: '/voucher-cashback.png',
        is_active: true,
        usage_limit: 300,
        usage_count: 0
      }
    ];

    for (const voucher of vouchers) {
      await db.query(`
        INSERT INTO vouchers (code, title, description, discount_type, discount_value, min_purchase, max_discount, start_date, end_date, image_url, is_active, usage_limit, usage_count, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, {
        replacements: [
          voucher.code, voucher.title, voucher.description, voucher.discount_type,
          voucher.discount_value, voucher.min_purchase, voucher.max_discount,
          voucher.start_date, voucher.end_date, voucher.image_url, voucher.is_active,
          voucher.usage_limit, voucher.usage_count, new Date(), new Date()
        ],
        type: db.QueryTypes.INSERT
      });
    }
    console.log(`   ✅ ${vouchers.length} vouchers berhasil dibuat`);

    // 5. Insert sample bookings
    console.log('📅 Membuat sample bookings...');
    const [usersResult] = await db.query('SELECT id FROM users WHERE role = "user"');
    const [courtsResult] = await db.query('SELECT id, arena_id, price_per_hour FROM courts');

    let bookingCount = 0;
    const currentDate = new Date();

    // Buat bookings untuk 30 hari terakhir dan 30 hari ke depan
    for (let dayOffset = -30; dayOffset <= 30; dayOffset++) {
      const bookingDate = new Date(currentDate);
      bookingDate.setDate(currentDate.getDate() + dayOffset);

      // Skip jika hari Minggu (untuk variasi)
      if (bookingDate.getDay() === 0) continue;

      // Buat 2-5 bookings per hari
      const dailyBookings = Math.floor(Math.random() * 4) + 2;

      for (let i = 0; i < dailyBookings; i++) {
        const randomUser = usersResult[Math.floor(Math.random() * usersResult.length)];
        const randomCourt = courtsResult[Math.floor(Math.random() * courtsResult.length)];

        // Random time slot (8-20)
        const startHour = Math.floor(Math.random() * 12) + 8;
        const duration = Math.floor(Math.random() * 3) + 1; // 1-3 jam

        const startTime = `${startHour.toString().padStart(2, '0')}:00`;
        const endTime = `${(startHour + duration).toString().padStart(2, '0')}:00`;

        const totalAmount = randomCourt.price_per_hour * duration;
        const paymentStatus = Math.random() > 0.2 ? 'paid' : 'pending'; // 80% paid

        await db.query(`
          INSERT INTO bookings (
            user_id, court_id, arena_id, booking_date, start_time, end_time,
            total_price, final_total_amount, payment_status, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, {
          replacements: [
            randomUser.id, randomCourt.id, randomCourt.arena_id,
            bookingDate.toISOString().split('T')[0], startTime, endTime,
            totalAmount, totalAmount, paymentStatus,
            paymentStatus === 'paid' ? 'confirmed' : 'pending',
            new Date(), new Date()
          ],
          type: db.QueryTypes.INSERT
        });

        bookingCount++;
      }
    }
    console.log(`   ✅ ${bookingCount} bookings berhasil dibuat`);

    console.log('🎉 Seeding data baru selesai!');

  } catch (error) {
    console.error('❌ Error saat seeding data:', error);
    throw error;
  }
}

module.exports = { resetDatabase, seedNewData };

// Jika script dipanggil langsung
if (require.main === module) {
  (async () => {
    try {
      await resetDatabase();
      await seedNewData();
      console.log('🎉 Reset dan seeding database selesai!');
      process.exit(0);
    } catch (error) {
      console.error('❌ Proses gagal:', error);
      process.exit(1);
    } finally {
      await db.close();
    }
  })();
}
