// Script untuk mengisi data dummy lengkap sesuai kriteria
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

// Data nama Indonesia untuk users
const namaIndonesia = [
  'Ahmad Wijaya', 'Siti Nurhaliza', 'Budi Santoso', 'Dewi Lestari', 'Andi Pratama',
  'Maya Sari', 'Rizki Ramadhan', 'Indira Putri', 'Fajar Nugroho', 'Rina Wati',
  'Dedi Kurniawan', 'Lina Marlina', 'Agus Setiawan', 'Ratna Dewi', 'Hendra Gunawan',
  'Sari Indah', 'Bambang Sutrisno', 'Fitri Handayani', 'Joko Widodo', 'Ani Yulianti',
  'Rudi Hartono', 'Mega Wulandari', 'Tono Supriyanto', 'Diah Permatasari', 'Eko Prasetyo',
  'Wulan Dari', 'Arief Rahman', 'Sinta Dewi', 'Bayu Aji', 'Nita Sari',
  'Dimas Anggara', 'Putri Utami', 'Wahyu Hidayat', 'Lia Amelia', 'Irfan Hakim',
  'Yuni Shara', 'Adi Nugroho', 'Rini Soemarno', 'Teguh Karya', 'Dina Mariana',
  'Surya Paloh', 'Evi Tamala', 'Gunawan Maryanto', 'Siska Salman', 'Reza Rahadian',
  'Titi Kamal', 'Denny Cagur', 'Luna Maya', 'Raffi Ahmad', 'Nagita Slavina'
];

async function resetAndSeedData() {
  try {
    console.log('🔄 Memulai reset dan seeding data lengkap...');
    
    await db.authenticate();
    console.log('✅ Koneksi database berhasil');

    // Reset database
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    const tables = ['user_vouchers', 'bookings', 'courts', 'arenas', 'vouchers', 'users'];
    
    console.log('🗑️ Menghapus semua data...');
    for (const table of tables) {
      try {
        await db.query(`DELETE FROM ${table}`);
        await db.query(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
        console.log(`   ✅ Tabel ${table} berhasil direset`);
      } catch (error) {
        console.log(`   ⚠️ Tabel ${table}: ${error.message}`);
      }
    }
    await db.query('SET FOREIGN_KEY_CHECKS = 1');

    // 1. Insert 50 Users dengan nama Indonesia
    console.log('👥 Membuat 50 users dengan nama Indonesia...');
    const users = [];
    for (let i = 0; i < 50; i++) {
      const name = namaIndonesia[i];
      const email = `${name.toLowerCase().replace(/\s+/g, '.')}${i + 1}@gmail.com`;
      const phone = `081${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
      const birthYear = 1980 + Math.floor(Math.random() * 25); // 1980-2004
      const birthMonth = Math.floor(Math.random() * 12) + 1;
      const birthDay = Math.floor(Math.random() * 28) + 1;
      const birthDate = `${birthYear}-${birthMonth.toString().padStart(2, '0')}-${birthDay.toString().padStart(2, '0')}`;
      
      await db.query(`
        INSERT INTO users (name, email, password, phone, birth_date, role, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, {
        replacements: [
          name, 
          email, 
          '$2b$10$dummy.hash.for.testing.purposes.only',
          phone,
          birthDate,
          i === 0 ? 'admin' : 'user', // User pertama jadi admin
          new Date()
        ],
        type: db.QueryTypes.INSERT
      });
    }
    console.log(`   ✅ 50 users berhasil dibuat`);

    // 2. Insert 10 Arenas (termasuk yang dari Surabaya)
    console.log('🏟️ Membuat 10 arenas lengkap...');
    const arenas = [
      // Arena dari Surabaya (sesuai mock data)
      {
        name: 'Arena Victory Badminton',
        address: 'Jl. Merdeka No.10',
        city: 'Surabaya',
        category: 'Badminton',
        description: 'Lapangan badminton indoor berstandar nasional. Lantai kayu, pencahayaan optimal, dan ruang ganti yang bersih. Cocok untuk latihan, komunitas, atau turnamen di pusat kota Surabaya.',
        price_per_hour: 80000,
        rating: 4.5,
        reviews_count: 123,
        images: JSON.stringify(['/foto_lapangan.png', '/arena-victory-2.jpg']),
        facilities: JSON.stringify(['AC', 'Parkir', 'Kantin', 'Toilet', 'Locker Room']),
        opening_hours: '08:00-22:00'
      },
      {
        name: 'Lapangan Bintang Sport',
        address: 'Jl. Pahlawan No.22',
        city: 'Surabaya',
        category: 'Badminton',
        description: 'Arena badminton dengan fasilitas lengkap di kawasan Pahlawan. Dilengkapi dengan sistem pencahayaan LED dan lantai vinyl berkualitas tinggi.',
        price_per_hour: 75000,
        rating: 4.2,
        reviews_count: 87,
        images: JSON.stringify(['/foto_lapangan1.jpg', '/bintang-sport-2.jpg']),
        facilities: JSON.stringify(['AC', 'Parkir', 'Toilet', 'Sound System']),
        opening_hours: '07:00-23:00'
      },
      {
        name: 'ZUPER KEPUTIH',
        address: 'Jl. Keputih No.15',
        city: 'Surabaya',
        category: 'Badminton',
        description: 'Arena badminton modern di kawasan Keputih dengan konsep sporty dan nyaman. Dekat dengan kampus dan area perumahan.',
        price_per_hour: 70000,
        rating: 4.7,
        reviews_count: 156,
        images: JSON.stringify(['/foto_lapangan2.jpg', '/zuper-keputih-2.jpg']),
        facilities: JSON.stringify(['AC', 'Parkir', 'Kantin', 'WiFi', 'Mushola']),
        opening_hours: '06:00-24:00'
      },
      {
        name: 'ZUPER DHARMAHUSADA',
        address: 'Jl. Dharmahusada No.30',
        city: 'Surabaya',
        category: 'Badminton',
        description: 'Arena badminton premium di kawasan Dharmahusada dengan standar internasional. Cocok untuk turnamen dan latihan profesional.',
        price_per_hour: 85000,
        rating: 4.6,
        reviews_count: 112,
        images: JSON.stringify(['/foto_lapangan3.jpg', '/zuper-dharma-2.jpg']),
        facilities: JSON.stringify(['AC', 'Parkir Luas', 'Kantin', 'Pro Shop', 'Spectator Area']),
        opening_hours: '06:00-23:00'
      },
      // Arena Jakarta
      {
        name: 'SportaFit Arena Central Jakarta',
        address: 'Jl. Sudirman No. 123, Senayan',
        city: 'Jakarta Pusat',
        category: 'Badminton',
        description: 'Arena badminton premium di pusat kota Jakarta dengan fasilitas terlengkap. Dilengkapi dengan AC, sound system, dan pencahayaan LED berkualitas tinggi.',
        price_per_hour: 120000,
        rating: 4.8,
        reviews_count: 245,
        images: JSON.stringify(['/arena-central-1.jpg', '/arena-central-2.jpg', '/arena-central-3.jpg']),
        facilities: JSON.stringify(['AC', 'Parkir Luas', 'Kantin', 'Mushola', 'Locker Room', 'Sound System', 'LED Lighting']),
        opening_hours: '06:00-24:00'
      },
      {
        name: 'SportaFit Arena Kelapa Gading',
        address: 'Jl. Boulevard Raya No. 456, Kelapa Gading',
        city: 'Jakarta Utara',
        category: 'Badminton',
        description: 'Arena badminton modern di kawasan Kelapa Gading dengan standar internasional. Cocok untuk turnamen dan latihan profesional.',
        price_per_hour: 100000,
        rating: 4.6,
        reviews_count: 198,
        images: JSON.stringify(['/arena-gading-1.jpg', '/arena-gading-2.jpg']),
        facilities: JSON.stringify(['AC', 'Parkir', 'Kantin', 'Mushola', 'Pro Shop', 'Spectator Area']),
        opening_hours: '07:00-23:00'
      },
      // Arena lainnya
      {
        name: 'SportaFit Arena BSD',
        address: 'Jl. BSD Raya No. 789, Serpong',
        city: 'Tangerang Selatan',
        category: 'Badminton',
        description: 'Arena badminton terbaru di BSD dengan konsep eco-friendly. Menggunakan teknologi ramah lingkungan dan ventilasi alami.',
        price_per_hour: 90000,
        rating: 4.7,
        reviews_count: 167,
        images: JSON.stringify(['/arena-bsd-1.jpg', '/arena-bsd-2.jpg', '/arena-bsd-3.jpg']),
        facilities: JSON.stringify(['AC', 'Parkir', 'Kantin Organic', 'Mushola', 'Kids Area', 'Eco Locker']),
        opening_hours: '06:00-22:00'
      },
      {
        name: 'Arena Badminton Bandung Premier',
        address: 'Jl. Asia Afrika No. 45, Bandung',
        city: 'Bandung',
        category: 'Badminton',
        description: 'Arena badminton premium di pusat kota Bandung dengan view pegunungan. Udara sejuk dan fasilitas modern.',
        price_per_hour: 85000,
        rating: 4.5,
        reviews_count: 134,
        images: JSON.stringify(['/arena-bandung-1.jpg', '/arena-bandung-2.jpg']),
        facilities: JSON.stringify(['AC', 'Parkir', 'Kantin', 'Mushola', 'Mountain View']),
        opening_hours: '07:00-22:00'
      },
      {
        name: 'Semarang Sports Center',
        address: 'Jl. Pemuda No. 88, Semarang',
        city: 'Semarang',
        category: 'Badminton',
        description: 'Pusat olahraga terpadu di Semarang dengan lapangan badminton berstandar nasional. Cocok untuk event besar.',
        price_per_hour: 75000,
        rating: 4.4,
        reviews_count: 98,
        images: JSON.stringify(['/arena-semarang-1.jpg', '/arena-semarang-2.jpg']),
        facilities: JSON.stringify(['AC', 'Parkir Luas', 'Kantin', 'Mushola', 'Event Hall']),
        opening_hours: '06:00-23:00'
      },
      {
        name: 'Yogya Badminton Arena',
        address: 'Jl. Malioboro No. 156, Yogyakarta',
        city: 'Yogyakarta',
        category: 'Badminton',
        description: 'Arena badminton di jantung kota Yogyakarta dengan nuansa tradisional modern. Dekat dengan pusat wisata.',
        price_per_hour: 70000,
        rating: 4.6,
        reviews_count: 189,
        images: JSON.stringify(['/arena-yogya-1.jpg', '/arena-yogya-2.jpg']),
        facilities: JSON.stringify(['AC', 'Parkir', 'Kantin', 'Mushola', 'Cultural Touch']),
        opening_hours: '07:00-22:00'
      }
    ];

    for (const arena of arenas) {
      await db.query(`
        INSERT INTO arenas (name, address, city, category, description, price_per_hour, rating, reviews_count, images, facilities, opening_hours, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, {
        replacements: [
          arena.name, arena.address, arena.city, arena.category, arena.description,
          arena.price_per_hour, arena.rating, arena.reviews_count, arena.images,
          arena.facilities, arena.opening_hours, new Date()
        ],
        type: db.QueryTypes.INSERT
      });
    }
    console.log(`   ✅ 10 arenas berhasil dibuat`);

    // 3. Insert Courts untuk setiap arena
    console.log('🎾 Membuat courts untuk setiap arena...');
    const [arenasResult] = await db.query('SELECT id FROM arenas ORDER BY id');
    let courtCount = 0;

    for (const arena of arenasResult) {
      // Setiap arena memiliki 4-8 courts
      const numCourts = Math.floor(Math.random() * 5) + 4; // 4-8 courts

      for (let i = 1; i <= numCourts; i++) {
        await db.query(`
          INSERT INTO courts (arena_id, name, type, price_per_hour, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `, {
          replacements: [
            arena.id,
            `Court ${i}`,
            i <= 2 ? 'Premium' : 'Standard',
            50000 + (Math.floor(Math.random() * 6) * 10000), // 50k-100k
            'active',
            new Date()
          ],
          type: db.QueryTypes.INSERT
        });
        courtCount++;
      }
    }
    console.log(`   ✅ ${courtCount} courts berhasil dibuat`);

    // 4. Insert 4 Vouchers (sesuai data asli)
    console.log('🎫 Membuat 4 vouchers...');
    const vouchers = [
      {
        code: 'CASHBACK20',
        title: 'Voucher Cashback s/d Rp 20.000',
        description: 'Dapatkan cashback hingga Rp 20.000 untuk pemesanan lapangan apa saja',
        discount_type: 'percentage',
        discount_value: 10,
        min_purchase: 100000,
        max_discount: 20000,
        start_date: '2023-01-01 00:00:00',
        end_date: '2025-08-17 23:59:59',
        image_url: '/Voucher1.png',
        is_active: true,
        usage_limit: 100
      },
      {
        code: 'QRISBCA25',
        title: 'Pakai QRIS BCA – Cashback Hingga 25%',
        description: 'Gunakan metode pembayaran QRIS BCA dan dapatkan cashback hingga 25%',
        discount_type: 'percentage',
        discount_value: 25,
        min_purchase: 50000,
        max_discount: 50000,
        start_date: '2023-01-01 00:00:00',
        end_date: '2025-03-30 23:59:59',
        image_url: '/Voucher2.png',
        is_active: true,
        usage_limit: 200
      },
      {
        code: 'DISKON15',
        title: 'Voucher Diskon 15% Booking Lapangan',
        description: 'Diskon 15% untuk pemesanan lapangan apa saja',
        discount_type: 'percentage',
        discount_value: 15,
        min_purchase: 0,
        max_discount: 30000,
        start_date: '2023-01-01 00:00:00',
        end_date: '2025-12-31 23:59:59',
        image_url: '/Voucher3.png',
        is_active: true,
        usage_limit: 150
      },
      {
        code: 'GRATISRAKET',
        title: 'Gratis Sewa Raket Badminton',
        description: 'Dapatkan gratis sewa raket badminton untuk setiap pemesanan lapangan',
        discount_type: 'fixed',
        discount_value: 15000,
        min_purchase: 75000,
        max_discount: null,
        start_date: '2023-01-01 00:00:00',
        end_date: '2025-11-30 23:59:59',
        image_url: '/Voucher4.png',
        is_active: true,
        usage_limit: 50
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
          voucher.usage_limit, 0, new Date(), new Date()
        ],
        type: db.QueryTypes.INSERT
      });
    }
    console.log(`   ✅ 4 vouchers berhasil dibuat`);

    console.log('🎉 Seeding data dasar selesai!');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

module.exports = { resetAndSeedData };

// Jika script dipanggil langsung
if (require.main === module) {
  (async () => {
    try {
      await resetAndSeedData();
      console.log('🎉 Seeding data lengkap selesai!');
      process.exit(0);
    } catch (error) {
      console.error('❌ Proses gagal:', error);
      process.exit(1);
    } finally {
      await db.close();
    }
  })();
}
