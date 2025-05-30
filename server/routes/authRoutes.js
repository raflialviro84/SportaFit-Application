// server/routes/authRoutes.js
const router = require("express").Router();
const authController = require("../controllers/authController");

// Endpoint register
router.post("/register", authController.register);

// Endpoint login
router.post("/login", authController.login);

// Endpoint untuk request reset password
router.post("/forgot-password", authController.forgotPassword);

// Endpoint untuk verifikasi kode
router.post("/verify-code", authController.verifyCode);

// Endpoint untuk reset password (dengan atau tanpa token di header)
router.post("/reset-password", authController.resetPassword);

// Endpoint alternatif untuk reset password dengan token di URL
router.post("/reset-password/:token", (req, res, next) => {
  // Tambahkan token dari URL ke header Authorization
  if (req.params.token) {
    req.headers.authorization = `Bearer ${req.params.token}`;
  }
  next();
}, authController.resetPassword);

// Endpoint untuk mendapatkan data user berdasarkan token
router.get("/me", (req, res) => {
  // Ambil token dari header Authorization
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }

  try {
    // Verifikasi token
    const jwt = require("jsonwebtoken");
    const User = require("../models/userModel");
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");

    // Cari user berdasarkan id dari token
    User.findOne({ where: { id: decoded.userId } })
      .then(user => {
        console.log('[Auth API /me] Decoded User ID:', decoded.userId); // Added log
        console.log('[Auth API /me] User from DB:', user ? user.toJSON() : null); // Added log, ensuring user is not null before toJSON

        if (!user) {
          console.log('[Auth API /me] User not found in DB for ID:', decoded.userId); // Added log
          return res.status(404).json({ message: "Pengguna tidak ditemukan" });
        }

        // Hapus password dari respons
        const userData = user.toJSON();
        console.log('[Auth API /me] User data (raw from toJSON()):', userData); // Added log
        delete userData.password;
        console.log('[Auth API /me] User data (after deleting password):', userData); // Added log

        res.json({ user: userData });
      })
      .catch(err => {
        console.error('[Auth API /me] Error fetching user:', err); // Added log
        res.status(500).json({ message: err.message });
      });
  } catch (err) {
    console.error('[Auth API /me] Token verification error or other sync error:', err); // Added log
    res.status(401).json({ message: "Token tidak valid" });
  }
});

// Endpoint logout
router.post("/logout", authController.logout);

// Endpoint untuk refresh token
router.post('/refresh-token', authController.refreshToken);

module.exports = router;