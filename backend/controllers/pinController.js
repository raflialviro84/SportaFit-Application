// server/controllers/pinController.js
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

// Fungsi untuk memeriksa apakah user memiliki PIN
exports.checkPin = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Cari user berdasarkan ID
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }
    
    // Cek apakah user memiliki PIN
    const hasPin = user.pin !== null && user.pin !== undefined;
    
    return res.status(200).json({
      success: true,
      hasPin
    });
  } catch (error) {
    console.error('Error in checkPin:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memeriksa PIN'
    });
  }
};

// Fungsi untuk membuat PIN baru
exports.createPin = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pin } = req.body;
    
    // Validasi PIN
    if (!pin || pin.length !== 6 || !/^\d+$/.test(pin)) {
      return res.status(400).json({
        success: false,
        message: 'PIN harus terdiri dari 6 digit angka'
      });
    }
    
    // Cari user berdasarkan ID
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }
    
    // Cek apakah user sudah memiliki PIN
    if (user.pin) {
      return res.status(400).json({
        success: false,
        message: 'User sudah memiliki PIN. Gunakan endpoint update untuk mengubah PIN'
      });
    }
    // Debug log untuk audit input PIN
    console.log('[DEBUG][createPin] userId:', userId);
    console.log('[DEBUG][createPin] pin (input):', pin, typeof pin);
    // Hash PIN sebelum disimpan
    const hashedPin = await bcrypt.hash(pin, 10);
    console.log('[DEBUG][createPin] hashedPin:', hashedPin);
    
    // Simpan PIN ke database
    user.pin = hashedPin;
    await user.save();
    
    return res.status(201).json({
      success: true,
      message: 'PIN berhasil dibuat'
    });
  } catch (error) {
    console.error('Error in createPin:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat membuat PIN'
    });
  }
};

// Fungsi untuk memverifikasi PIN
exports.verifyPin = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pin } = req.body;
    
    // Validasi PIN
    if (!pin || pin.length !== 6 || !/^\d+$/.test(pin)) {
      return res.status(400).json({
        success: false,
        message: 'PIN harus terdiri dari 6 digit angka'
      });
    }
    
    // Cari user berdasarkan ID
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }
    
    // Cek apakah user memiliki PIN
    if (!user.pin) {
      return res.status(400).json({
        success: false,
        message: 'User belum memiliki PIN'
      });
    }
    
    // Verifikasi PIN
    const isPinValid = await bcrypt.compare(pin, user.pin);
    
    return res.status(200).json({
      success: true,
      isValid: isPinValid
    });
  } catch (error) {
    console.error('Error in verifyPin:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memverifikasi PIN'
    });
  }
};

// Fungsi untuk mengubah PIN
exports.updatePin = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPin, newPin } = req.body;
    
    // Validasi PIN
    if (!newPin || newPin.length !== 6 || !/^\d+$/.test(newPin)) {
      return res.status(400).json({
        success: false,
        message: 'PIN baru harus terdiri dari 6 digit angka'
      });
    }
    
    // Cari user berdasarkan ID
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }
    
    // Cek apakah user memiliki PIN
    if (!user.pin) {
      return res.status(400).json({
        success: false,
        message: 'User belum memiliki PIN. Gunakan endpoint create untuk membuat PIN baru'
      });
    }
    // Debug log untuk audit PIN lama dan hash di database
    console.log('[DEBUG][updatePin] userId:', userId);
    console.log('[DEBUG][updatePin] oldPin (input):', oldPin);
    console.log('[DEBUG][updatePin] user.pin (hash):', user.pin);
    // Verifikasi PIN lama
    const isPinValid = await bcrypt.compare(oldPin, user.pin);
    console.log('[DEBUG][updatePin] isPinValid:', isPinValid);
    if (!isPinValid) {
      return res.status(401).json({
        success: false,
        message: 'PIN lama tidak valid'
      });
    }
    
    // Hash PIN baru sebelum disimpan
    const hashedPin = await bcrypt.hash(newPin, 10);
    
    // Simpan PIN baru ke database
    user.pin = hashedPin;
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'PIN berhasil diubah'
    });
  } catch (error) {
    console.error('Error in updatePin:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengubah PIN'
    });
  }
};
