// server/controllers/voucherController.js
const { Voucher, UserVoucher } = require('../models/voucherModel');
const { User } = require('../models/userModel');
const { Op } = require('sequelize');
const db = require('../db');

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
    console.log(`Getting vouchers for user ID: ${userId}`);
    
    // Dapatkan voucher yang dimiliki oleh user menggunakan fungsi baru
    const vouchers = await Voucher.getVouchersByUserId(userId);
    
    if (!Array.isArray(vouchers) || vouchers.length === 0) {
      console.log("No vouchers found for user, returning empty array");
      return res.status(200).json({ success: true, data: [] });
    }
    
    console.log(`Found ${vouchers.length} vouchers for user`);
    
    // Format data untuk response
    const formattedVouchers = vouchers.map(voucher => {
      const validUntil = voucher.end_date ? new Date(voucher.end_date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }) : null;
      
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
        isUsed: voucher.isUsed || false,
        usedAt: voucher.usedAt || null
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

// ==================== ADMIN CONTROLLERS ====================

// Controller untuk mendapatkan semua voucher untuk admin
exports.getAllVouchersAdmin = async (req, res) => {
  try {
    // Cek apakah user adalah admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang dapat mengakses endpoint ini.'
      });
    }

    const { page = 1, limit = 10, search = '', status = 'all' } = req.query;
    const offset = (page - 1) * limit;

    // Build where condition
    let whereCondition = {};

    if (search) {
      whereCondition = {
        [Op.or]: [
          { title: { [Op.like]: `%${search}%` } },
          { code: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ]
      };
    }

    if (status !== 'all') {
      whereCondition.is_active = status === 'active';
    }

    const { count, rows: vouchers } = await Voucher.findAndCountAll({
      where: whereCondition,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    // Get user statistics for each voucher separately
    const formattedVouchers = await Promise.all(vouchers.map(async (voucher) => {
      // Count total users who have this voucher
      const totalUsers = await UserVoucher.count({
        where: { voucher_id: voucher.id }
      });

      // Count users who have used this voucher
      const usedCount = await UserVoucher.count({
        where: { voucher_id: voucher.id, is_used: true }
      });

      return {
        id: voucher.id,
        code: voucher.code,
        title: voucher.title,
        description: voucher.description,
        discountType: voucher.discount_type,
        discountValue: voucher.discount_value,
        minPurchase: voucher.min_purchase,
        maxDiscount: voucher.max_discount,
        startDate: voucher.start_date,
        endDate: voucher.end_date,
        imageUrl: voucher.image_url,
        isActive: voucher.is_active,
        usageLimit: voucher.usage_limit,
        usageCount: voucher.usage_count,
        totalUsers: totalUsers,
        usedCount: usedCount,
        createdAt: voucher.created_at,
        updatedAt: voucher.updated_at
      };
    }));

    res.status(200).json({
      success: true,
      data: {
        vouchers: formattedVouchers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error in getAllVouchersAdmin controller:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mendapatkan daftar voucher',
      error: error.message
    });
  }
};

// Controller untuk mendapatkan statistik voucher
exports.getVoucherStats = async (req, res) => {
  try {
    // Cek apakah user adalah admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang dapat mengakses endpoint ini.'
      });
    }

    // Total voucher
    const totalVouchers = await Voucher.count();

    // Voucher aktif
    const activeVouchers = await Voucher.count({
      where: { is_active: true }
    });

    // Voucher tidak aktif
    const inactiveVouchers = totalVouchers - activeVouchers;

    // Total penggunaan voucher
    const totalUsage = await UserVoucher.count({
      where: { is_used: true }
    });

    // Voucher yang paling populer (paling banyak dimiliki user)
    const popularVouchersQuery = await db.query(`
      SELECT
        v.id,
        v.title,
        v.code,
        COUNT(uv.user_id) as userCount
      FROM vouchers v
      LEFT JOIN user_vouchers uv ON v.id = uv.voucher_id
      WHERE v.is_active = 1
      GROUP BY v.id, v.title, v.code
      ORDER BY userCount DESC
      LIMIT 5
    `, { type: db.QueryTypes.SELECT });

    // Voucher yang paling sering digunakan
    const mostUsedVouchersQuery = await db.query(`
      SELECT
        v.id,
        v.title,
        v.code,
        COUNT(uv.user_id) as usageCount
      FROM vouchers v
      LEFT JOIN user_vouchers uv ON v.id = uv.voucher_id AND uv.is_used = 1
      WHERE v.is_active = 1
      GROUP BY v.id, v.title, v.code
      ORDER BY usageCount DESC
      LIMIT 5
    `, { type: db.QueryTypes.SELECT });

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalVouchers,
          activeVouchers,
          inactiveVouchers,
          totalUsage
        },
        popularVouchers: popularVouchersQuery,
        mostUsedVouchers: mostUsedVouchersQuery
      }
    });
  } catch (error) {
    console.error('Error in getVoucherStats controller:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mendapatkan statistik voucher',
      error: error.message
    });
  }
};

// Controller untuk membuat voucher baru
exports.createVoucher = async (req, res) => {
  try {
    // Cek apakah user adalah admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang dapat mengakses endpoint ini.'
      });
    }

    const {
      code,
      title,
      description,
      discountType,
      discountValue,
      minPurchase = 0,
      maxDiscount,
      startDate,
      endDate,
      imageUrl,
      usageLimit
    } = req.body;

    // Validasi input
    if (!code || !title || !discountType || !discountValue || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Field wajib: code, title, discountType, discountValue, startDate, endDate'
      });
    }

    // Validasi discount type
    if (!['percentage', 'fixed'].includes(discountType)) {
      return res.status(400).json({
        success: false,
        message: 'discountType harus berupa "percentage" atau "fixed"'
      });
    }

    // Validasi tanggal
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal mulai harus lebih awal dari tanggal berakhir'
      });
    }

    // Cek apakah kode voucher sudah ada
    const existingVoucher = await Voucher.findOne({
      where: { code: code }
    });

    if (existingVoucher) {
      return res.status(400).json({
        success: false,
        message: 'Kode voucher sudah digunakan'
      });
    }

    // Buat voucher baru
    const newVoucher = await Voucher.create({
      code,
      title,
      description,
      discount_type: discountType,
      discount_value: discountValue,
      min_purchase: minPurchase,
      max_discount: maxDiscount,
      start_date: startDate,
      end_date: endDate,
      image_url: imageUrl,
      usage_limit: usageLimit,
      is_active: true,
      usage_count: 0
    });

    res.status(201).json({
      success: true,
      message: 'Voucher berhasil dibuat',
      data: {
        id: newVoucher.id,
        code: newVoucher.code,
        title: newVoucher.title,
        description: newVoucher.description,
        discountType: newVoucher.discount_type,
        discountValue: newVoucher.discount_value,
        minPurchase: newVoucher.min_purchase,
        maxDiscount: newVoucher.max_discount,
        startDate: newVoucher.start_date,
        endDate: newVoucher.end_date,
        imageUrl: newVoucher.image_url,
        usageLimit: newVoucher.usage_limit,
        isActive: newVoucher.is_active
      }
    });
  } catch (error) {
    console.error('Error in createVoucher controller:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat voucher',
      error: error.message
    });
  }
};

// Controller untuk update voucher
exports.updateVoucher = async (req, res) => {
  try {
    // Cek apakah user adalah admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang dapat mengakses endpoint ini.'
      });
    }

    const { id } = req.params;
    const {
      code,
      title,
      description,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      startDate,
      endDate,
      imageUrl,
      usageLimit,
      isActive
    } = req.body;

    // Cari voucher
    const voucher = await Voucher.findByPk(id);
    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher tidak ditemukan'
      });
    }

    // Validasi discount type jika diberikan
    if (discountType && !['percentage', 'fixed'].includes(discountType)) {
      return res.status(400).json({
        success: false,
        message: 'discountType harus berupa "percentage" atau "fixed"'
      });
    }

    // Validasi tanggal jika diberikan
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start >= end) {
        return res.status(400).json({
          success: false,
          message: 'Tanggal mulai harus lebih awal dari tanggal berakhir'
        });
      }
    }

    // Cek apakah kode voucher sudah ada (jika kode diubah)
    if (code && code !== voucher.code) {
      const existingVoucher = await Voucher.findOne({
        where: { code: code, id: { [Op.ne]: id } }
      });

      if (existingVoucher) {
        return res.status(400).json({
          success: false,
          message: 'Kode voucher sudah digunakan'
        });
      }
    }

    // Update voucher
    const updateData = {};
    if (code !== undefined) updateData.code = code;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (discountType !== undefined) updateData.discount_type = discountType;
    if (discountValue !== undefined) updateData.discount_value = discountValue;
    if (minPurchase !== undefined) updateData.min_purchase = minPurchase;
    if (maxDiscount !== undefined) updateData.max_discount = maxDiscount;
    if (startDate !== undefined) updateData.start_date = startDate;
    if (endDate !== undefined) updateData.end_date = endDate;
    if (imageUrl !== undefined) updateData.image_url = imageUrl;
    if (usageLimit !== undefined) updateData.usage_limit = usageLimit;
    if (isActive !== undefined) updateData.is_active = isActive;

    await voucher.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Voucher berhasil diupdate',
      data: {
        id: voucher.id,
        code: voucher.code,
        title: voucher.title,
        description: voucher.description,
        discountType: voucher.discount_type,
        discountValue: voucher.discount_value,
        minPurchase: voucher.min_purchase,
        maxDiscount: voucher.max_discount,
        startDate: voucher.start_date,
        endDate: voucher.end_date,
        imageUrl: voucher.image_url,
        usageLimit: voucher.usage_limit,
        isActive: voucher.is_active
      }
    });
  } catch (error) {
    console.error('Error in updateVoucher controller:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate voucher',
      error: error.message
    });
  }
};

// Controller untuk menghapus voucher (soft delete)
exports.deleteVoucher = async (req, res) => {
  try {
    // Cek apakah user adalah admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang dapat mengakses endpoint ini.'
      });
    }

    const { id } = req.params;

    // Cari voucher
    const voucher = await Voucher.findByPk(id);
    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher tidak ditemukan'
      });
    }

    // Soft delete dengan mengubah is_active menjadi false
    await voucher.update({ is_active: false });

    res.status(200).json({
      success: true,
      message: 'Voucher berhasil dihapus'
    });
  } catch (error) {
    console.error('Error in deleteVoucher controller:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus voucher',
      error: error.message
    });
  }
};

// Controller untuk mendapatkan daftar user yang memiliki voucher tertentu
exports.getVoucherUsers = async (req, res) => {
  try {
    // Cek apakah user adalah admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang dapat mengakses endpoint ini.'
      });
    }

    const { id } = req.params;
    const { page = 1, limit = 10, status = 'all' } = req.query;
    const offset = (page - 1) * limit;

    // Cari voucher
    const voucher = await Voucher.findByPk(id);
    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher tidak ditemukan'
      });
    }

    // Build where condition untuk UserVoucher
    let whereCondition = { voucher_id: id };

    if (status === 'used') {
      whereCondition.is_used = true;
    } else if (status === 'unused') {
      whereCondition.is_used = false;
    }

    // Use a more direct approach with a join to get both user vouchers and user data
    const { count, rows } = await UserVoucher.findAndCountAll({
      where: whereCondition,
      include: [{
        model: User,
        attributes: ['id', 'name', 'email', 'phone', 'created_at'],
        required: true
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    // Format the response
    const formattedUsers = rows.map(uv => {
      return {
        userId: uv.User ? uv.User.id : null,
        name: uv.User ? uv.User.name : 'Unknown User',
        email: uv.User ? uv.User.email : '',
        phone: uv.User ? uv.User.phone : '',
        isUsed: uv.is_used,
        usedAt: uv.used_at,
        addedAt: uv.created_at,
        userCreatedAt: uv.User ? uv.User.created_at : null
      };
    });

    res.status(200).json({
      success: true,
      data: {
        voucher: {
          id: voucher.id,
          code: voucher.code,
          title: voucher.title
        },
        users: formattedUsers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error in getVoucherUsers controller:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mendapatkan daftar user voucher',
      error: error.message
    });
  }
};
