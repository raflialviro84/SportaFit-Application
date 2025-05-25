// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Middleware untuk memeriksa apakah user sudah login
const authMiddleware = async (req, res, next) => {
  try {
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
      return res.status(401).json({
        success: false,
        message: 'Tidak ada token autentikasi'
      });
    }
    
    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Cari user berdasarkan ID dari token
    const user = await User.findOne({ where: { id: decoded.userId } });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }
    
    // Tambahkan user ke request
    req.user = user;
    
    // Lanjutkan ke handler berikutnya
    next();
  } catch (error) {
    console.error('Error in authMiddleware:', error);
    if (typeof error === 'object' && error !== null) {
      console.error('Error stack:', error.stack);
    }
    if (req.query && req.query.token) {
      console.error('Token from query param:', req.query.token);
    }
    if (req.headers && req.headers.authorization) {
      console.error('Token from header:', req.headers.authorization);
    }
    
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

module.exports = authMiddleware;
