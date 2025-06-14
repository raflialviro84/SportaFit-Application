// server/migrations/vouchers.js
const db = require('../db');

async function createVouchersTable() {
  try {
    // Cek apakah tabel vouchers sudah ada
    const [tables] = await db.query("SHOW TABLES LIKE 'vouchers'");
    
    if (tables.length === 0) {
      // Buat tabel vouchers jika belum ada
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
      
      // Buat tabel user_vouchers untuk relasi many-to-many antara users dan vouchers
      await db.query(`
        CREATE TABLE user_vouchers (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          voucher_id INT NOT NULL,
          is_used BOOLEAN DEFAULT FALSE,
          used_at DATETIME DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON DELETE CASCADE,
          UNIQUE KEY user_voucher_unique (user_id, voucher_id)
        )
      `);
      
      console.log('Tables vouchers and user_vouchers created successfully');
      
      // Tambahkan data dummy untuk voucher
      await db.query(`
        INSERT INTO vouchers (code, title, description, discount_type, discount_value, min_purchase, max_discount, start_date, end_date, image_url, is_active, usage_limit)
        VALUES 
        ('CASHBACK20', 'Voucher Cashback s/d Rp 20.000', 'Dapatkan cashback hingga Rp 20.000 untuk pemesanan lapangan apa saja', 'percentage', 10, 100000, 20000, '2023-01-01 00:00:00', '2025-08-17 23:59:59', '/Voucher1.png', TRUE, 100),
        ('QRISBCA25', 'Pakai QRIS BCA – Cashback Hingga 25%', 'Gunakan metode pembayaran QRIS BCA dan dapatkan cashback hingga 25%', 'percentage', 25, 50000, 50000, '2023-01-01 00:00:00', '2025-03-30 23:59:59', '/Voucher2.png', TRUE, 200),
        ('DISKON15', 'Voucher Diskon 15% Booking Lapangan', 'Diskon 15% untuk pemesanan lapangan apa saja', 'percentage', 15, 0, 30000, '2023-01-01 00:00:00', '2025-12-31 23:59:59', '/Voucher3.png', TRUE, 150),
        ('GRATISRAKET', 'Gratis Sewa Raket Badminton', 'Dapatkan gratis sewa raket badminton untuk setiap pemesanan lapangan', 'fixed', 15000, 75000, NULL, '2023-01-01 00:00:00', '2025-11-30 23:59:59', '/Voucher4.png', TRUE, 50)
      `);
      
      console.log('Dummy vouchers data inserted successfully');
    } else {
      console.log('Table vouchers already exists');
    }
  } catch (error) {
    console.error('Error creating vouchers tables:', error);
    throw error;
  }
}

module.exports = createVouchersTable;
