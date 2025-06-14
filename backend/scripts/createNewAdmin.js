// scripts/createNewAdmin.js
require('dotenv').config({ path: '../.env' });
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

async function createNewAdmin() {
  try {
    // Konfigurasi admin baru
    const adminEmail = 'admin@sportafit.com';
    const adminPassword = 'admin123';
    const adminName = 'Demo Admin';

    console.log('Mencari admin yang sudah ada...');
    // Cek apakah admin dengan email tersebut sudah ada
    const existingAdmin = await User.findOne({
      where: {
        email: adminEmail
      }
    });

    if (existingAdmin) {
      console.log('Admin dengan email tersebut sudah ada. Mencoba update password...');
      
      // Hash password baru
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      // Update password admin yang sudah ada
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      
      console.log('=========================================');
      console.log('Password admin berhasil diperbarui!');
      console.log('Email: ' + adminEmail);
      console.log('Password: ' + adminPassword);
      console.log('=========================================');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Buat admin baru
    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      created_at: new Date()
    });

    console.log('=========================================');
    console.log('Admin baru berhasil dibuat!');
    console.log('Email: ' + adminEmail);
    console.log('Password: ' + adminPassword);
    console.log('=========================================');
    
  } catch (error) {
    console.error('Error saat membuat admin baru:', error);
  } finally {
    process.exit();
  }
}

createNewAdmin();