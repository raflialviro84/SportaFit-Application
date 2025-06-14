const { Sequelize, Op } = require('sequelize');
const db = require('../db');
const User = require('../models/userModel');
const Arena = require('../models/arenaModel');
const Court = require('../models/courtModel');
const Booking = require('../models/bookingModel');

// Fungsi untuk menghasilkan nomor invoice
const generateInvoiceNumber = (date) => {
  const dateStr = date.toISOString().slice(2, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const suffix = Math.floor(Math.random() * 90 + 10);
  return `INV-${dateStr}-${random}-${suffix}`;
};

// Fungsi untuk menghasilkan waktu acak
const generateRandomTime = () => {
  const hours = Math.floor(Math.random() * 16) + 8; // 8-23
  return `${String(hours).padStart(2, '0')}:00`;
};

// Fungsi untuk menghasilkan slot waktu
const generateTimeSlots = (startHour, duration) => {
  const slots = [];
  for (let i = 0; i < duration; i++) {
    const hour = startHour + i;
    if (hour < 24) {
      const start = `${String(hour).padStart(2, '0')}:00`;
      const end = `${String(hour + 1).padStart(2, '0')}:00`;
      slots.push(`${start} - ${end}`);
    }
  }
  return slots;
};

// Data nama users untuk dummy
const dummyUserNames = [
  'Ahmad Rizki', 'Budi Santoso', 'Citra Dewi', 'Dani Pratama', 'Eka Sari',
  'Fajar Nugroho', 'Gita Permata', 'Hendra Wijaya', 'Indra Gunawan', 'Joko Susilo',
  'Karina Putri', 'Lukman Hakim', 'Maya Sinta', 'Nando Pratama', 'Olivia Tan',
  'Putra Ramadan', 'Qori Maharani', 'Reza Febrian', 'Sari Melati', 'Toni Setiawan',
  'Udin Saefudin', 'Vita Anggraini', 'Wawan Kurniawan', 'Xena Lestari', 'Yudi Hermawan',
  'Zaki Rahman', 'Anisa Fitri', 'Bayu Aditya', 'Cindy Liem', 'Dimas Eko',
  'Elsa Ramadhani', 'Faris Akbar', 'Grace Natalia', 'Haris Maulana', 'Intan Permatasari',
  'Jihan Aulia', 'Kevin Adiputra', 'Linda Sari', 'Mikael Tanojo', 'Nina Kartika',
  'Oscar Pratama', 'Priska Dewi', 'Qais Abdullah', 'Ratna Sari', 'Steven Chandra',
  'Tina Wulandari', 'Ucok Simbolon', 'Vina Maharani', 'Willy Gunawan', 'Yolanda Putri'
];

// Metode pembayaran yang tersedia
const paymentMethods = ['dana', 'gopay', 'ovo', 'bank_transfer'];

// Status booking yang mungkin
const bookingStatuses = ['confirmed', 'completed', 'cancelled'];
const completedStatuses = ['confirmed', 'completed'];

async function generateDummyData() {
  try {
    console.log('🚀 Memulai generate data dummy...');
    
    // 1. Buat users dummy jika belum ada
    console.log('📝 Membuat users dummy...');
    const existingUsers = await User.findAll();
    let users = existingUsers;
    
    if (existingUsers.length < 50) {
      const usersToCreate = [];
      for (let i = existingUsers.length; i < 50; i++) {
        const userName = dummyUserNames[i % dummyUserNames.length];
        const email = `${userName.toLowerCase().replace(/\s+/g, '.')}${i}@example.com`;
        
        usersToCreate.push({
          name: userName,
          email: email,
          password: '$2b$10$dummy.hash.for.testing.purposes.only', // dummy hash
          phone: `081${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
          role: 'user',
          created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date dalam 1 tahun terakhir
          updated_at: new Date()
        });
      }
      
      const newUsers = await User.bulkCreate(usersToCreate);
      users = [...existingUsers, ...newUsers];
      console.log(`✅ Berhasil membuat ${newUsers.length} users dummy`);
    }

    // 2. Buat arenas dummy jika belum ada
    console.log('🏟️ Membuat arenas dummy...');
    let arenas = await Arena.findAll();
    
    if (arenas.length < 5) {
      const arenasToCreate = [
        {
          name: 'SportaFit Arena Central',
          address: 'Jl. Sudirman No. 123',
          city: 'Jakarta',
          category: 'Badminton',
          description: 'Arena badminton premium di pusat kota',
          price_range: '50000-80000',
          rating: 4.8,
          images: JSON.stringify(['arena1.png', 'arena2.png']),
          facilities: JSON.stringify(['AC', 'Parkir', 'Kantin', 'Mushola']),
          operating_hours: '08:00-23:00',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: 'Elite Badminton Club',
          address: 'Jl. Gatot Subroto No. 456',
          city: 'Jakarta',
          category: 'Badminton',
          description: 'Klub badminton elite dengan fasilitas lengkap',
          price_range: '60000-100000',
          rating: 4.9,
          images: JSON.stringify(['arena2.png', 'arena3.png']),
          facilities: JSON.stringify(['AC', 'Parkir', 'Locker', 'Cafe']),
          operating_hours: '07:00-22:00',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: 'Mega Sport Center',
          address: 'Jl. Thamrin No. 789',
          city: 'Bogor',
          category: 'Badminton',
          description: 'Pusat olahraga terlengkap di Bogor',
          price_range: '40000-70000',
          rating: 4.6,
          images: JSON.stringify(['arena1.png', 'arena3.png']),
          facilities: JSON.stringify(['AC', 'Parkir', 'Kantin']),
          operating_hours: '08:00-23:00',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: 'Prime Badminton Hall',
          address: 'Jl. Kuningan No. 321',
          city: 'Depok',
          category: 'Badminton',
          description: 'Hall badminton premium di Depok',
          price_range: '45000-75000',
          rating: 4.7,
          images: JSON.stringify(['arena2.png', 'arena1.png']),
          facilities: JSON.stringify(['AC', 'Parkir', 'Mushola', 'Cafe']),
          operating_hours: '09:00-22:00',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: 'Victory Sports Arena',
          address: 'Jl. Kemang No. 654',
          city: 'Tangerang',
          category: 'Badminton',
          description: 'Arena olahraga terbaik di Tangerang',
          price_range: '50000-85000',
          rating: 4.5,
          images: JSON.stringify(['arena3.png', 'arena2.png']),
          facilities: JSON.stringify(['AC', 'Parkir', 'Locker']),
          operating_hours: '08:00-23:00',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];
      
      const newArenas = await Arena.bulkCreate(arenasToCreate);
      arenas = [...arenas, ...newArenas];
      console.log(`✅ Berhasil membuat ${newArenas.length} arenas dummy`);
    }

    // 3. Buat courts untuk setiap arena jika belum ada
    console.log('🎾 Membuat courts dummy...');
    let courts = await Court.findAll();
    
    if (courts.length < 20) {
      const courtsToCreate = [];
      for (const arena of arenas) {
        // Buat 4 court per arena
        for (let i = 1; i <= 4; i++) {
          const existingCourt = courts.find(c => c.arena_id === arena.id && c.name === `Court ${i}`);
          if (!existingCourt) {
            courtsToCreate.push({
              arena_id: arena.id,
              name: `Court ${i}`,
              type: 'indoor',
              price_per_hour: Math.floor(Math.random() * 30000) + 50000, // 50k-80k
              status: 'active',
              description: `Lapangan ${i} dengan fasilitas lengkap`,
              created_at: new Date(),
              updated_at: new Date()
            });
          }
        }
      }
      
      if (courtsToCreate.length > 0) {
        const newCourts = await Court.bulkCreate(courtsToCreate);
        courts = [...courts, ...newCourts];
        console.log(`✅ Berhasil membuat ${newCourts.length} courts dummy`);
      }
    }

    // 4. Generate bookings untuk 12 bulan terakhir
    console.log('📅 Generating bookings untuk 12 bulan terakhir...');
    
    const now = new Date();
    const startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1); // 12 bulan yang lalu
    
    let totalBookingsCreated = 0;
    
    for (let monthOffset = 0; monthOffset < 12; monthOffset++) {
      const currentMonth = new Date(startDate.getFullYear(), startDate.getMonth() + monthOffset, 1);
      const nextMonth = new Date(startDate.getFullYear(), startDate.getMonth() + monthOffset + 1, 1);
      
      console.log(`📆 Generating data untuk ${currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}...`);
      
      const bookingsInMonth = [];
      
      // Generate 100 bookings per bulan
      for (let i = 0; i < 100; i++) {
        // Random date dalam bulan tersebut
        const randomDay = Math.floor(Math.random() * 28) + 1; // 1-28 aman untuk semua bulan
        const bookingDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), randomDay);
        
        // Random user dan court
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomCourt = courts[Math.floor(Math.random() * courts.length)];
        
        // Random time dan duration
        const startHour = Math.floor(Math.random() * 14) + 8; // 8-21
        const duration = Math.floor(Math.random() * 3) + 1; // 1-3 jam
        const timeSlots = generateTimeSlots(startHour, duration);
        
        const startTime = timeSlots[0].split(' - ')[0];
        const endTime = timeSlots[timeSlots.length - 1].split(' - ')[1];
        
        // Hitung harga
        const totalPrice = duration * randomCourt.price_per_hour;
        const serviceFee = 5000;
        const protectionFee = Math.random() > 0.5 ? 10000 : 0; // 50% chance protection
        const discountAmount = Math.random() > 0.8 ? Math.floor(totalPrice * 0.1) : 0; // 20% chance discount 10%
        const finalTotalAmount = totalPrice + serviceFee + protectionFee - discountAmount;
        
        // Random status (lebih banyak yang completed untuk data realistis)
        const statusRandom = Math.random();
        let status, paymentStatus;
        if (statusRandom < 0.85) {
          status = 'completed';
          paymentStatus = 'paid';
        } else if (statusRandom < 0.95) {
          status = 'confirmed';
          paymentStatus = 'paid';
        } else {
          status = 'cancelled';
          paymentStatus = 'unpaid';
        }
        
        // Random payment method
        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        
        // Random created_at dalam bulan tersebut tapi sebelum booking_date
        const createdAt = new Date(
          bookingDate.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000 // 0-7 hari sebelum booking
        );
        
        bookingsInMonth.push({
          user_id: randomUser.id,
          court_id: randomCourt.id,
          arena_id: randomCourt.arena_id,
          invoice_number: generateInvoiceNumber(createdAt),
          booking_date: bookingDate.toISOString().split('T')[0], // YYYY-MM-DD format
          start_time: startTime,
          end_time: endTime,
          time_slots_details: JSON.stringify(timeSlots),
          total_price: totalPrice,
          service_fee: serviceFee,
          protection_fee: protectionFee,
          discount_amount: discountAmount,
          final_total_amount: finalTotalAmount,
          status: status,
          payment_status: paymentStatus,
          payment_method: paymentStatus === 'paid' ? paymentMethod : null,
          activity: 'Badminton',
          created_at: createdAt,
          updated_at: createdAt,
          expiry_time: null // Tidak perlu expiry untuk data lama
        });
      }
      
      // Bulk insert bookings untuk bulan ini
      try {
        await Booking.bulkCreate(bookingsInMonth);
        totalBookingsCreated += bookingsInMonth.length;
        console.log(`✅ Berhasil membuat ${bookingsInMonth.length} bookings untuk ${currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`);
      } catch (error) {
        console.error(`❌ Error membuat bookings untuk ${currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}:`, error);
      }
    }
    
    console.log(`🎉 SELESAI! Total ${totalBookingsCreated} bookings berhasil dibuat`);
    
    // Tampilkan ringkasan data
    const finalStats = {
      totalUsers: await User.count(),
      totalArenas: await Arena.count(),
      totalCourts: await Court.count(),
      totalBookings: await Booking.count(),
      totalRevenue: await Booking.sum('final_total_amount', {
        where: { payment_status: 'paid' }
      })
    };
    
    console.log('\n📊 RINGKASAN DATA:');
    console.log(`👥 Total Users: ${finalStats.totalUsers}`);
    console.log(`🏟️ Total Arenas: ${finalStats.totalArenas}`);
    console.log(`🎾 Total Courts: ${finalStats.totalCourts}`);
    console.log(`📅 Total Bookings: ${finalStats.totalBookings}`);
    console.log(`💰 Total Revenue: Rp ${(finalStats.totalRevenue || 0).toLocaleString('id-ID')}`);
    
  } catch (error) {
    console.error('❌ Error generating dummy data:', error);
  } finally {
    await db.close();
    console.log('🔐 Database connection closed');
  }
}

// Jalankan script jika dipanggil langsung
if (require.main === module) {
  generateDummyData();
}

module.exports = { generateDummyData };