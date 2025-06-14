// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Middleware untuk memeriksa apakah user sudah login
const authMiddleware = async (req, res, next) => {
  try {
    // Debug: log Authorization header
    console.log('Authorization header:', req.headers.authorization);
    let token;
    
    // Check for token in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } 
    // If not in header, check query parameters (for SSE)
    else if (req.query && req.query.token) {
      token = req.query.token;
      console.log("Token found in query parameter for SSE or other direct link.");
    }

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({
        success: false,
        message: 'Tidak ada token autentikasi'
      });
    }
    
    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Decoded JWT:', decoded);
    
    // Validate decoded token structure - support both 'id' and 'userId' fields
    const userId = decoded.userId || decoded.id;
    if (!userId) {
      console.log('Token missing userId/id field. Decoded token:', decoded);
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid - missing user identifier'
      });
    }
    
    console.log('Using user ID from token:', userId);
    
    // Cari user berdasarkan ID dari token
    const user = await User.findOne({ 
      where: { id: userId },
      attributes: ['id', 'name', 'email', 'role'] // Only select necessary fields
    });
    
    console.log('User found:', user ? { id: user.id, email: user.email, role: user.role } : null);
    
    if (!user) {
      console.log('User not found in database for id:', userId);
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }
    
    // Ensure user object has required properties
    if (!user.id) {
      console.log('User object missing id property');
      return res.status(500).json({
        success: false,
        message: 'User data invalid - missing id'
      });
    }
    
    // Tambahkan user ke request
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    console.log('req.user set to:', req.user);
    
    // Lanjutkan ke handler berikutnya
    next();
  } catch (error) {
    console.error('Error in authMiddleware:', error);
    console.error('Error stack:', error.stack);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token sudah kadaluarsa'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Middleware khusus untuk admin yang lebih robust
const adminMiddleware = async (req, res, next) => {
  console.log('adminMiddleware called - Authorization header:', req.headers.authorization);
  try {
    let token;
    
    // Check for token in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    // Also check for adminToken in authorization header
    else if (authHeader && authHeader.startsWith('AdminToken ')) {
      token = authHeader.split(' ')[1];
    }
    // Check localStorage token stored by admin login
    else if (req.headers['x-admin-token']) {
      token = req.headers['x-admin-token'];
    }
    // Check query parameters for admin token
    else if (req.query && req.query.adminToken) {
      token = req.query.adminToken;
    }
    
    if (!token) {
      console.log('No admin token provided');
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required'
      });
    }
    
    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Decoded Admin JWT:', decoded);
    
    // Validate decoded token structure - support both 'id' and 'userId' fields
    const userId = decoded.userId || decoded.id;
    if (!userId) {
      console.log('Admin token missing userId/id field. Decoded token:', decoded);
      return res.status(401).json({
        success: false,
        message: 'Invalid admin token'
      });
    }
    
    // Cari user berdasarkan ID dari token
    const user = await User.findOne({ 
      where: { id: userId },
      attributes: ['id', 'name', 'email', 'role'] 
    });
    
    console.log('Admin user found:', user ? { id: user.id, email: user.email, role: user.role } : null);
    
    // Verifikasi user ditemukan
    if (!user) {
      console.log('Admin user not found for id:', userId);
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }
    
    // Untuk development, izinkan semua user mengakses endpoint admin untuk memudahkan testing
    const isDevMode = process.env.NODE_ENV !== 'production';
    const isAdminRole = user.role === 'admin';
    
    // Verifikasi role admin (lebih fleksibel untuk development)
    if (!isAdminRole && !isDevMode) {
      console.log('Access denied: User is not admin:', user.email, 'Role:', user.role);
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    } else if (!isAdminRole && isDevMode) {
      console.log('DEVELOPMENT MODE: Non-admin user accessing admin routes:', user.email, 'Role:', user.role);
    }
    
    // Tambahkan user ke request
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    console.log('Admin authenticated successfully:', req.user.email);
    
    // Lanjutkan ke handler berikutnya
    next();
  } catch (error) {
    console.error('Error in adminMiddleware:', error);
    console.error('Error stack:', error.stack);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Admin token expired'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = { authMiddleware, adminMiddleware };
