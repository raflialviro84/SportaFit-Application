// server/controllers/voucherController.js
const { Voucher, UserVoucher } = require('../models/voucherModel');
const User = require('../models/userModel');

// Controller untuk mendapatkan semua voucher
exports.getAllVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.getAllVouchers();
    
    // Format data untuk response
    const formattedVouchers = vouchers.map(voucher => {
      const validUntil = new Date(voucher.end_date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      return {
        id: voucher.id,
        title: voucher.title,
        validUntil: validUntil,
        imageUrl: voucher.image_url,
        code: voucher.code,
        description: voucher.description,
        discountType: voucher.discount_type,
        discountValue: voucher.discount_value,
        minPurchase: voucher.min_purchase,
        maxDiscount: voucher.max_discount
      };
    });
    
    res.status(200).json({
      success: true,
      data: formattedVouchers
    });
  } catch (error) {
    console.error('Error in getAllVouchers controller:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mendapatkan daftar voucher',
      error: error.message
    });
  }
};

// Controller untuk mendapatkan detail voucher berdasarkan ID
exports.getVoucherById = async (req, res) => {
  try {
    const { id } = req.params;
    const voucher = await Voucher.getVoucherById(id);
    
    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher tidak ditemukan'
      });
    }
    
    // Format data untuk response
    const validUntil = new Date(voucher.end_date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const formattedVoucher = {
      id: voucher.id,
      code: voucher.code,
      title: voucher.title,
      description: voucher.description,
      discountType: voucher.discount_type,
      discountValue: voucher.discount_value,
      minPurchase: voucher.min_purchase,
      maxDiscount: voucher.max_discount,
      validUntil: validUntil,
      imageUrl: voucher.image_url,
      isActive: voucher.is_active,
      usageLimit: voucher.usage_limit,
      usageCount: voucher.usage_count
    };
    
    res.status(200).json({
      success: true,
      data: formattedVoucher
    });
  } catch (error) {
    console.error('Error in getVoucherById controller:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mendapatkan detail voucher',
      error: error.message
    });
  }
};

// Controller untuk mendapatkan voucher berdasarkan kode
exports.getVoucherByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const voucher = await Voucher.getVoucherByCode(code);
    
    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher tidak ditemukan'
      });
    }
    
    // Format data untuk response
    const validUntil = new Date(voucher.end_date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const formattedVoucher = {
      id: voucher.id,
      code: voucher.code,
      title: voucher.title,
      description: voucher.description,
      discountType: voucher.discount_type,
      discountValue: voucher.discount_value,
      minPurchase: voucher.min_purchase,
      maxDiscount: voucher.max_discount,
      validUntil: validUntil,
      imageUrl: voucher.image_url,
      isActive: voucher.is_active,
      usageLimit: voucher.usage_limit,
      usageCount: voucher.usage_count
    };
    
    res.status(200).json({
      success: true,
      data: formattedVoucher
    });
  } catch (error) {
    console.error('Error in getVoucherByCode controller:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mendapatkan detail voucher',
      error: error.message
    });
  }
};

// Controller untuk mendapatkan voucher yang dimiliki oleh user
exports.getUserVouchers = async (req, res) => {
  try {
    // Ambil user ID dari token
    const userId = req.user.id;
    // Dapatkan voucher yang dimiliki oleh user
    const vouchers = await Voucher.getVouchersByUserId(userId);
    if (!Array.isArray(vouchers) || vouchers.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }
    // Format data untuk response
    const formattedVouchers = vouchers.map(voucher => {
      const validUntil = voucher.end_date ? new Date(voucher.end_date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }) : null;
      let userVoucher = null;
      // Fix: Only access Users[0] if Users exists, is array, and has at least one element
      if (voucher.Users && Array.isArray(voucher.Users) && voucher.Users.length > 0 && voucher.Users[0].user_vouchers) {
        userVoucher = voucher.Users[0].user_vouchers;
      }
      return {
        id: voucher.id,
        title: voucher.title,
        validUntil: validUntil || '-',
        imageUrl: voucher.image_url,
        code: voucher.code,
        description: voucher.description,
        discountType: voucher.discount_type,
        discountValue: voucher.discount_value,
        minPurchase: voucher.min_purchase,
        maxDiscount: voucher.max_discount,
        isUsed: userVoucher ? userVoucher.is_used : false,
        usedAt: userVoucher ? userVoucher.used_at : null
      };
    });
    res.status(200).json({
      success: true,
      data: formattedVouchers
    });
  } catch (error) {
    console.error('Error in getUserVouchers controller:', error, error.stack);
    res.status(500).json({
      success: false,
      message: 'Gagal mendapatkan daftar voucher user',
      error: error.message
    });
  }
};

// Controller untuk menambahkan voucher ke user
exports.addVoucherToUser = async (req, res) => {
  try {
    // Ambil user ID dari token
    const userId = req.user.id;
    
    // Ambil voucher ID atau code dari request body
    const { voucherId, voucherCode } = req.body;
    
    let voucher;
    
    if (voucherId) {
      // Jika voucherId diberikan, gunakan itu
      voucher = await Voucher.getVoucherById(voucherId);
    } else if (voucherCode) {
      // Jika voucherCode diberikan, gunakan itu
      voucher = await Voucher.getVoucherByCode(voucherCode);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Voucher ID atau kode voucher harus diberikan'
      });
    }
    
    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher tidak ditemukan'
      });
    }
    
    // Cek apakah voucher masih aktif
    if (!voucher.is_active) {
      return res.status(400).json({
        success: false,
        message: 'Voucher tidak aktif'
      });
    }
    
    // Cek apakah voucher masih berlaku
    const now = new Date();
    if (now < new Date(voucher.start_date) || now > new Date(voucher.end_date)) {
      return res.status(400).json({
        success: false,
        message: 'Voucher tidak berlaku'
      });
    }
    
    // Cek apakah voucher sudah mencapai batas penggunaan
    if (voucher.usage_limit !== null && voucher.usage_count >= voucher.usage_limit) {
      return res.status(400).json({
        success: false,
        message: 'Voucher sudah mencapai batas penggunaan'
      });
    }
    
    // Tambahkan voucher ke user
    await Voucher.addVoucherToUser(userId, voucher.id);
    
    res.status(200).json({
      success: true,
      message: 'Voucher berhasil ditambahkan ke user',
      data: {
        id: voucher.id,
        code: voucher.code,
        title: voucher.title
      }
    });
  } catch (error) {
    console.error('Error in addVoucherToUser controller:', error);
    
    // Jika error karena user sudah memiliki voucher
    if (error.message === 'User already has this voucher') {
      return res.status(400).json({
        success: false,
        message: 'User sudah memiliki voucher ini'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan voucher ke user',
      error: error.message
    });
  }
};

// Controller untuk menggunakan voucher
exports.useVoucher = async (req, res) => {
  try {
    // Ambil user ID dari token
    const userId = req.user.id;
    
    // Ambil voucher ID atau code dari request body
    const { voucherId, voucherCode } = req.body;
    
    let voucher;
    
    if (voucherId) {
      // Jika voucherId diberikan, gunakan itu
      voucher = await Voucher.getVoucherById(voucherId);
    } else if (voucherCode) {
      // Jika voucherCode diberikan, gunakan itu
      voucher = await Voucher.getVoucherByCode(voucherCode);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Voucher ID atau kode voucher harus diberikan'
      });
    }
    
    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher tidak ditemukan'
      });
    }
    
    // Gunakan voucher
    await Voucher.useVoucher(userId, voucher.id);
    
    res.status(200).json({
      success: true,
      message: 'Voucher berhasil digunakan',
      data: {
        id: voucher.id,
        code: voucher.code,
        title: voucher.title,
        discountType: voucher.discount_type,
        discountValue: voucher.discount_value,
        maxDiscount: voucher.max_discount
      }
    });
  } catch (error) {
    console.error('Error in useVoucher controller:', error);
    
    // Jika error karena voucher tidak ditemukan atau sudah digunakan
    if (error.message === 'Voucher not found or already used') {
      return res.status(400).json({
        success: false,
        message: 'Voucher tidak ditemukan atau sudah digunakan'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Gagal menggunakan voucher',
      error: error.message
    });
  }
};
