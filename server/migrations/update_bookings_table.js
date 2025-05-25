// server/migrations/update_bookings_table.js
const db = require('../db');

async function updateBookingsTable() {
  try {
    console.log('Starting migration: update_bookings_table');

    // Add arena_id column
    try {
      await db.query("SELECT arena_id FROM bookings LIMIT 1");
      console.log("'arena_id' column already exists in bookings table.");
    } catch (e) {
      console.log("Adding 'arena_id' column to bookings table...");
      await db.query("ALTER TABLE bookings ADD COLUMN arena_id INT NULL AFTER court_id;"); // Changed to NULL to allow existing rows to be valid
      await db.query("ALTER TABLE bookings ADD CONSTRAINT fk_bookings_arena_id FOREIGN KEY (arena_id) REFERENCES arenas(id);");
      console.log("'arena_id' column added.");
    }

    // Add time_slots_details column
    try {
      await db.query("SELECT time_slots_details FROM bookings LIMIT 1");
      console.log("'time_slots_details' column already exists.");
    } catch (e) {
      console.log("Adding 'time_slots_details' column...");
      await db.query("ALTER TABLE bookings ADD COLUMN time_slots_details TEXT NULL AFTER end_time;");
      console.log("'time_slots_details' column added.");
    }

    // Add service_fee column
    try {
      await db.query("SELECT service_fee FROM bookings LIMIT 1");
      console.log("'service_fee' column already exists.");
    } catch (e) {
      console.log("Adding 'service_fee' column...");
      await db.query("ALTER TABLE bookings ADD COLUMN service_fee INT DEFAULT 0 AFTER total_price;");
      console.log("'service_fee' column added.");
    }

    // Add discount_amount column
    try {
      await db.query("SELECT discount_amount FROM bookings LIMIT 1");
      console.log("'discount_amount' column already exists.");
    } catch (e) {
      console.log("Adding 'discount_amount' column...");
      await db.query("ALTER TABLE bookings ADD COLUMN discount_amount INT DEFAULT 0 AFTER service_fee;");
      console.log("'discount_amount' column added.");
    }

    // Add protection_fee column
    try {
      await db.query("SELECT protection_fee FROM bookings LIMIT 1");
      console.log("'protection_fee' column already exists.");
    } catch (e) {
      console.log("Adding 'protection_fee' column...");
      await db.query("ALTER TABLE bookings ADD COLUMN protection_fee INT DEFAULT 0 AFTER discount_amount;");
      console.log("'protection_fee' column added.");
    }
    
    // Add final_total_amount column
    try {
      await db.query("SELECT final_total_amount FROM bookings LIMIT 1");
      console.log("'final_total_amount' column already exists.");
    } catch (e) {
      console.log("Adding 'final_total_amount' column...");
      await db.query("ALTER TABLE bookings ADD COLUMN final_total_amount INT NULL AFTER protection_fee;");
      console.log("'final_total_amount' column added.");
    }

    // Modify status ENUM
    console.log("Modifying 'status' ENUM column...");
    await db.query("ALTER TABLE bookings MODIFY COLUMN status ENUM('pending', 'confirmed', 'cancelled', 'completed', 'expired', 'cancelled_by_system') DEFAULT 'pending';");
    console.log("'status' ENUM column modified.");

    // Modify payment_status ENUM
    console.log("Modifying 'payment_status' ENUM column...");
    await db.query("ALTER TABLE bookings MODIFY COLUMN payment_status ENUM('unpaid', 'paid', 'refunded', 'failed') DEFAULT 'unpaid';");
    console.log("'payment_status' ENUM column modified.");

    // Add payment_method column
    try {
      await db.query("SELECT payment_method FROM bookings LIMIT 1");
      console.log("'payment_method' column already exists.");
    } catch (e) {
      console.log("Adding 'payment_method' column...");
      await db.query("ALTER TABLE bookings ADD COLUMN payment_method VARCHAR(255) NULL AFTER payment_status;");
      console.log("'payment_method' column added.");
    }

    // Add payment_gateway_transaction_id column
    try {
      await db.query("SELECT payment_gateway_transaction_id FROM bookings LIMIT 1");
      console.log("'payment_gateway_transaction_id' column already exists.");
    } catch (e) {
      console.log("Adding 'payment_gateway_transaction_id' column...");
      await db.query("ALTER TABLE bookings ADD COLUMN payment_gateway_transaction_id VARCHAR(255) NULL AFTER payment_method;");
      console.log("'payment_gateway_transaction_id' column added.");
    }

    // Add expiry_time column
    try {
      await db.query("SELECT expiry_time FROM bookings LIMIT 1");
      console.log("'expiry_time' column already exists.");
    } catch (e) {
      console.log("Adding 'expiry_time' column...");
      await db.query("ALTER TABLE bookings ADD COLUMN expiry_time DATETIME NULL AFTER invoice_number;");
      console.log("'expiry_time' column added.");
    }

    // Add activity column
    try {
      await db.query("SELECT activity FROM bookings LIMIT 1");
      console.log("'activity' column already exists.");
    } catch (e) {
      console.log("Adding 'activity' column...");
      await db.query("ALTER TABLE bookings ADD COLUMN activity VARCHAR(255) NULL AFTER expiry_time;");
      console.log("'activity' column added.");
    }

    // Add protection_status column
    try {
      await db.query("SELECT protection_status FROM bookings LIMIT 1");
      console.log("'protection_status' column already exists.");
    } catch (e) {
      console.log("Adding 'protection_status' column...");
      await db.query("ALTER TABLE bookings ADD COLUMN protection_status BOOLEAN DEFAULT FALSE AFTER activity;");
      console.log("'protection_status' column added.");
    }

    // Add applied_voucher_id column
    try {
      await db.query("SELECT applied_voucher_id FROM bookings LIMIT 1");
      console.log("'applied_voucher_id' column already exists.");
    } catch (e) {
      console.log("Adding 'applied_voucher_id' column...");
      await db.query("ALTER TABLE bookings ADD COLUMN applied_voucher_id INT NULL AFTER protection_status;");
      console.log("'applied_voucher_id' column added.");
    }

    console.log('Migration completed: update_bookings_table');
  } catch (error) {
    console.error('Error in migration update_bookings_table:', error);
    throw error;
  }
}

module.exports = updateBookingsTable;
