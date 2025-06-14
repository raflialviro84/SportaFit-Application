// server/controllers/userController.js
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const { Op } = require('sequelize');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Format birth_date to birthDate (YYYY-MM-DD) for frontend
    const userObj = user.toJSON();
    if (userObj.birth_date) {
      // If already string in YYYY-MM-DD, use as is. If Date, format. Else, null.
      if (typeof userObj.birth_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(userObj.birth_date)) {
        userObj.birthDate = userObj.birth_date;
      } else if (userObj.birth_date instanceof Date && !isNaN(userObj.birth_date)) {
        userObj.birthDate = userObj.birth_date.toISOString().slice(0, 10);
      } else {
        userObj.birthDate = null;
      }
    } else {
      userObj.birthDate = null;
    }
    delete userObj.birth_date;
    res.json({ user: userObj });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile (with birth_date validation)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, birthDate, photoUrl } = req.body;
    // Validate birthDate (YYYY-MM-DD, not future, age 10-120)
    let birth_date = null;
    if (birthDate) {
      const date = new Date(birthDate);
      const now = new Date();
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: 'Format tanggal lahir tidak valid' });
      }
      if (date > now) {
        return res.status(400).json({ message: 'Tanggal lahir tidak boleh di masa depan' });
      }
      const age = now.getFullYear() - date.getFullYear();
      if (age < 10 || age > 120) {
        return res.status(400).json({ message: 'Usia harus antara 10 dan 120 tahun' });
      }
      birth_date = date;
    }
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    if (birth_date) user.birth_date = birth_date;
    if (photoUrl) user.photoUrl = photoUrl;
    await user.save();
    // Format birth_date to birthDate (YYYY-MM-DD) for frontend
    const userObj = user.toJSON();
    if (userObj.birth_date) {
      // If already string in YYYY-MM-DD, use as is. If Date, format. Else, null.
      if (typeof userObj.birth_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(userObj.birth_date)) {
        userObj.birthDate = userObj.birth_date;
      } else if (userObj.birth_date instanceof Date && !isNaN(userObj.birth_date)) {
        userObj.birthDate = userObj.birth_date.toISOString().slice(0, 10);
      } else {
        userObj.birthDate = null;
      }
    } else {
      userObj.birthDate = null;
    }
    delete userObj.birth_date;
    res.json({ message: 'Profil berhasil diperbarui', user: userObj });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user account
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.destroy(); // This will delete the user from the database

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get users count for admin dashboard
exports.getUsersCount = async (req, res) => {
  try {
    console.log('getUsersCount called by user:', req.user?.id, req.user?.email, req.user?.role);
    
    // Validate user authentication
    if (!req.user || !req.user.id) {
      console.error('getUsersCount: No authenticated user or user id missing');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
        error: 'Missing user id'
      });
    }

    const total = await User.count({
      where: {
        role: { [Op.ne]: 'admin' }, // Exclude admin users
        id: { [Op.ne]: null } // Ensure id is not null
      }
    });

    const recent = await User.findAll({
      where: {
        role: { [Op.ne]: 'admin' },
        id: { [Op.ne]: null } // Ensure id is not null
      },
      order: [['created_at', 'DESC']],
      limit: 5,
      attributes: ['id', 'name', 'email', 'created_at']
    });

    console.log('Users count - total:', total, 'recent:', recent.length);

    res.json({
      total: parseInt(total) || 0,
      recent: recent.map(user => {
        const safeUser = user.toJSON ? user.toJSON() : user;
        return {
          id: safeUser.id || 0,
          name: safeUser.name || 'Unknown',
          email: safeUser.email || 'No email',
          joinDate: safeUser.created_at || null,
          created_at: safeUser.created_at || null,
          status: 'active'
        };
      })
    });
  } catch (error) {
    console.error('Error getting users count:', error);
    console.error('Error stack:', error.stack);
    
    // More specific error handling
    if (error.name === 'SequelizeDatabaseError') {
      console.error('Database error details:', error.sql);
      return res.status(500).json({ 
        success: false,
        message: 'Database error while fetching users count',
        error: 'Database query failed'
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get all users for admin
exports.getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      role = '',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {};

    // Filter by role if specified
    if (role && role !== 'all') {
      whereClause.role = role;
    }

    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: ['id', 'name', 'email', 'phone', 'birth_date', 'role', 'created_at']
    });

    // Get booking count for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const bookingCount = await Booking.count({
          where: { user_id: user.id }
        });

        const totalSpent = await Booking.sum('final_total_amount', {
          where: {
            user_id: user.id,
            payment_status: 'paid'
          }
        });

        // Get last booking for activity status
        const lastBooking = await Booking.findOne({
          where: { user_id: user.id },
          order: [['created_at', 'DESC']],
          attributes: ['created_at']
        });

        // Determine user status based on activity
        const daysSinceLastBooking = lastBooking ?
          Math.floor((new Date() - new Date(lastBooking.created_at)) / (1000 * 60 * 60 * 24)) : null;

        let status = 'active';
        if (daysSinceLastBooking === null || daysSinceLastBooking > 90) {
          status = 'inactive';
        } else if (daysSinceLastBooking > 30) {
          status = 'inactive';
        }

        const userObj = user.toJSON();

        return {
          id: userObj.id,
          name: userObj.name,
          email: userObj.email,
          phone: userObj.phone || '',
          gender: 'male', // Default since not in DB
          date_of_birth: userObj.birth_date,
          address: '', // Not in DB
          city: 'Surabaya', // Default since not in DB
          profile_picture: null,
          email_verified: true, // Default since not in DB
          phone_verified: !!userObj.phone, // True if phone exists
          status,
          role: userObj.role === 'admin' ? 'admin' : 'member',
          last_login: lastBooking ? lastBooking.created_at : userObj.created_at,
          total_bookings: bookingCount,
          total_spent: totalSpent || 0,
          created_at: userObj.created_at
        };
      })
    );

    res.json({
      users: usersWithStats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalUsers: count,
        hasNext: page * limit < count,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get user details by ID
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'phone', 'birth_date', 'role', 'created_at']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's booking history
    const bookings = await Booking.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: 10,
      attributes: ['id', 'invoice_number', 'booking_date', 'status', 'final_total_amount', 'created_at']
    });

    const bookingCount = await Booking.count({
      where: { user_id: userId }
    });

    const totalSpent = await Booking.sum('final_total_amount', {
      where: { 
        user_id: userId,
        payment_status: 'paid'
      }
    });

    // Format birth_date to birthDate for frontend consistency
    const userObj = user.toJSON();
    if (userObj.birth_date) {
      if (typeof userObj.birth_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(userObj.birth_date)) {
        userObj.birthDate = userObj.birth_date;
      } else if (userObj.birth_date instanceof Date && !isNaN(userObj.birth_date)) {
        userObj.birthDate = userObj.birth_date.toISOString().slice(0, 10);
      } else {
        userObj.birthDate = null;
      }
    } else {
      userObj.birthDate = null;
    }

    res.json({
      user: {
        ...userObj,
        bookingCount,
        totalSpent: totalSpent || 0,
        status: 'active'
      },
      recentBookings: bookings
    });
  } catch (error) {
    console.error('Error getting user by ID:', error);
    res.status(500).json({ message: error.message });
  }
};

// Admin: Create user
exports.createUserByAdmin = async (req, res) => {
  try {
    const { name, email, phone, password, birthDate, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, dan password wajib diisi' });
    }
    // Cek email sudah terdaftar
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email sudah terdaftar' });
    }
    let birth_date = null;
    if (birthDate) {
      const date = new Date(birthDate);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: 'Format tanggal lahir tidak valid' });
      }
      birth_date = date;
    }
    const newUser = await User.create({
      name,
      email,
      phone,
      password, // Pastikan hash password jika ada middleware
      birth_date,
      role: role || 'user',
    });
    res.status(201).json({ message: 'User berhasil dibuat', user: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Update user
exports.updateUserByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, phone, birthDate, role } = req.body;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (birthDate) {
      const date = new Date(birthDate);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: 'Format tanggal lahir tidak valid' });
      }
      user.birth_date = date;
    }
    await user.save();
    res.json({ message: 'User berhasil diupdate', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Delete user
exports.deleteUserByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.destroy();
    res.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user statistics for admin dashboard
exports.getUserStats = async (req, res) => {
  try {
    console.log('Getting user statistics for admin dashboard...');
    
    // Total users count - tidak menggunakan filter agar semua user terhitung
    const totalUsers = await User.count();
    console.log('Total users count:', totalUsers);

    // Active users (users with bookings in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsersResult = await Booking.findAll({
      where: {
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      },
      attributes: ['user_id'],
      group: ['user_id']
    });
    const activeUsers = activeUsersResult.length;
    console.log('Active users count:', activeUsers);

    // Users by role
    const adminCount = await User.count({ where: { role: 'admin' } });
    const memberCount = await User.count({ where: { role: 'user' } });
    console.log('Admin count:', adminCount, 'Member count:', memberCount);

    // New users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newUsersThisMonth = await User.count({
      where: {
        created_at: {
          [Op.gte]: startOfMonth
        }
      }
    });
    console.log('New users this month:', newUsersThisMonth);

    // Inactive users (no bookings in last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const usersWithRecentBookings = await Booking.findAll({
      where: {
        created_at: {
          [Op.gte]: ninetyDaysAgo
        }
      },
      attributes: ['user_id'],
      group: ['user_id']
    });

    const activeUserIds = usersWithRecentBookings.map(b => b.user_id);
    const inactiveUsers = totalUsers - activeUsers;
    console.log('Inactive users count:', inactiveUsers);

    const stats = {
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminCount,
      memberCount,
      newUsersThisMonth,
      suspendedUsers: 0 // Not implemented in current DB schema
    };

    console.log('Final user stats:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ message: error.message });
  }
};
