// Script untuk setup tabel voucher dan data sample
const path = require('path');
const { Sequelize } = require('sequelize');

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

async function setupVouchers() {
  try {
    console.log('Connecting to database...');
    await db.authenticate();
    console.log('Database connected successfully');

    // Cek apakah tabel vouchers sudah ada
    const [tables] = await db.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' 
      AND TABLE_NAME = 'vouchers' 
      AND TABLE_SCHEMA = DATABASE()
    `);

    if (tables.length === 0) {
      console.log('Creating vouchers table...');
      await db.query(`
        CREATE TABLE vouchers (
          id INT AUTO_INCREMENT PRIMARY KEY,
          code VARCHAR(50) NOT NULL UNIQUE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          discount_type ENUM('percentage', 'fixed') NOT NULL,
          discount_value DECIMAL(10, 2) NOT NULL,
          min_purchase DECIMAL(10, 2) DEFAULT 0,
          max_discount DECIMAL(10, 2) DEFAULT NULL,
          start_date DATETIME NOT NULL,
          end_date DATETIME NOT NULL,
          image_url VARCHAR(255),
          is_active BOOLEAN DEFAULT TRUE,
          usage_limit INT DEFAULT NULL,
          usage_count INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('Vouchers table created successfully');
    } else {
      console.log('Vouchers table already exists');
    }

    // Cek apakah tabel user_vouchers sudah ada
    const [userVoucherTables] = await db.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' 
      AND TABLE_NAME = 'user_vouchers' 
      AND TABLE_SCHEMA = DATABASE()
    `);

    if (userVoucherTables.length === 0) {
      console.log('Creating user_vouchers table...');
      await db.query(`
        CREATE TABLE user_vouchers (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          voucher_id INT NOT NULL,
          is_used BOOLEAN DEFAULT FALSE,
          used_at DATETIME NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON DELETE CASCADE,
          UNIQUE KEY unique_user_voucher (user_id, voucher_id)
        )
      `);
      console.log('User_vouchers table created successfully');
    } else {
      console.log('User_vouchers table already exists');
    }

    // Cek apakah sudah ada data voucher
    const [existingVouchers] = await db.query('SELECT COUNT(*) as count FROM vouchers');
    
    if (existingVouchers[0].count === 0) {
      console.log('Inserting sample voucher data...');
      
      const sampleVouchers = [
        {
          code: 'WELCOME25',
          title: 'Selamat Datang - Diskon 25%',
          description: 'Dapatkan diskon 25% untuk pemesanan pertama Anda! Berlaku untuk semua arena.',
          discount_type: 'percentage',
          discount_value: 25.00,
          min_purchase: 100000.00,
          max_discount: 50000.00,
          start_date: '2024-01-01 00:00:00',
          end_date: '2025-12-31 23:59:59',
          image_url: 'https://via.placeholder.com/400x200/6366f1/ffffff?text=Welcome+25%25',
          usage_limit: 1000
        },
        {
          code: 'CASHBACK50K',
          title: 'Cashback Rp 50.000',
          description: 'Cashback langsung Rp 50.000 untuk pemesanan minimal Rp 200.000',
          discount_type: 'fixed',
          discount_value: 50000.00,
          min_purchase: 200000.00,
          max_discount: null,
          start_date: '2024-06-01 00:00:00',
          end_date: '2025-06-30 23:59:59',
          image_url: 'https://via.placeholder.com/400x200/1e40af/ffffff?text=Cashback+50K',
          usage_limit: 500
        },
        {
          code: 'WEEKEND15',
          title: 'Weekend Special - 15% Off',
          description: 'Diskon khusus weekend 15% untuk semua pemesanan di hari Sabtu dan Minggu',
          discount_type: 'percentage',
          discount_value: 15.00,
          min_purchase: 75000.00,
          max_discount: 30000.00,
          start_date: '2024-01-01 00:00:00',
          end_date: '2025-12-31 23:59:59',
          image_url: 'https://via.placeholder.com/400x200/059669/ffffff?text=Weekend+15%25',
          usage_limit: null
        },
        {
          code: 'NEWUSER100K',
          title: 'Bonus Member Baru Rp 100.000',
          description: 'Bonus khusus member baru! Dapatkan potongan Rp 100.000 untuk pemesanan pertama',
          discount_type: 'fixed',
          discount_value: 100000.00,
          min_purchase: 300000.00,
          max_discount: null,
          start_date: '2024-01-01 00:00:00',
          end_date: '2025-12-31 23:59:59',
          image_url: 'https://via.placeholder.com/400x200/dc2626/ffffff?text=New+User+100K',
          usage_limit: 1
        },
        {
          code: 'LOYALTY20',
          title: 'Member Setia - Diskon 20%',
          description: 'Terima kasih atas kesetiaan Anda! Nikmati diskon 20% untuk pemesanan berikutnya',
          discount_type: 'percentage',
          discount_value: 20.00,
          min_purchase: 150000.00,
          max_discount: 75000.00,
          start_date: '2024-01-01 00:00:00',
          end_date: '2025-12-31 23:59:59',
          image_url: 'https://via.placeholder.com/400x200/7c3aed/ffffff?text=Loyalty+20%25',
          usage_limit: 3
        }
      ];

      for (const voucher of sampleVouchers) {
        await db.query(`
          INSERT INTO vouchers (
            code, title, description, discount_type, discount_value, 
            min_purchase, max_discount, start_date, end_date, 
            image_url, usage_limit, is_active, usage_count
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, 0)
        `, [
          voucher.code,
          voucher.title,
          voucher.description,
          voucher.discount_type,
          voucher.discount_value,
          voucher.min_purchase,
          voucher.max_discount,
          voucher.start_date,
          voucher.end_date,
          voucher.image_url,
          voucher.usage_limit
        ]);
      }

      console.log(`Inserted ${sampleVouchers.length} sample vouchers`);

      // Tambahkan beberapa user_vouchers sample
      console.log('Adding sample user voucher relationships...');
      
      // Ambil beberapa user ID yang ada
      const [users] = await db.query('SELECT id FROM users WHERE role != "admin" LIMIT 10');
      const [vouchers] = await db.query('SELECT id FROM vouchers LIMIT 5');

      if (users.length > 0 && vouchers.length > 0) {
        // Berikan voucher ke beberapa user
        for (let i = 0; i < Math.min(users.length, 5); i++) {
          const userId = users[i].id;
          
          // Berikan 2-3 voucher per user
          for (let j = 0; j < Math.min(vouchers.length, 3); j++) {
            const voucherId = vouchers[j].id;
            
            try {
              await db.query(`
                INSERT INTO user_vouchers (user_id, voucher_id, is_used, used_at)
                VALUES (?, ?, ?, ?)
              `, [
                userId,
                voucherId,
                Math.random() > 0.7, // 30% chance sudah digunakan
                Math.random() > 0.7 ? new Date() : null
              ]);
            } catch (error) {
              // Skip jika sudah ada (duplicate key)
              if (!error.message.includes('Duplicate entry')) {
                console.error('Error inserting user voucher:', error.message);
              }
            }
          }
        }
        
        console.log('Sample user voucher relationships added');
      }

    } else {
      console.log('Voucher data already exists');
    }

    console.log('Voucher setup completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error setting up vouchers:', error);
    process.exit(1);
  }
}

setupVouchers();
