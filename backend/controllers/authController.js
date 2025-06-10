// server/controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel"); // Pastikan model User sudah dibuat
const authService = require("../services/authService");

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email & password wajib diisi." });
    }
    await authService.register({ name, email, password, phone });
    res.status(201).json({ message: "Registrasi berhasil." });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ message: err.message || "Server error." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email & password wajib diisi." });
    }
    const user = await authService.login({ email, password });
    // Set session & cookie securely
    req.session.userId = user.id;
    res.cookie('token', user.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 hari
    });
    // Kembalikan token juga di root response agar frontend selalu dapat token
    res.json({ message: "Login sukses", user, token: user.token });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ message: err.message || "Server error." });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('token');
    res.json({ message: 'Logout sukses' });
  });
};

// Fungsi untuk request password reset (mengirimkan email)
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email wajib diisi." });
    }

    // Gunakan authService untuk mencari user dan mengirim email
    // Ini akan memastikan konsistensi dengan kode lain
    const result = await authService.forgotPassword(email);

    // Dalam implementasi nyata, jangan kirim kode verifikasi dalam respons
    // Kode hanya untuk debugging
    res.status(200).json({
      message: "Kode verifikasi berhasil dikirim. Cek email Anda.",
      // Hanya untuk debugging/development:
      verificationCode: result.verificationCode
    });
  } catch (err) {
    console.error("Error in forgotPassword controller:", err);
    res.status(err.status || 500).json({ message: err.message || "Gagal mengirim email reset." });
  }
};

// Fungsi untuk verifikasi kode
exports.verifyCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    if (!email || !code) {
      return res.status(400).json({ message: "Email dan kode verifikasi wajib diisi." });
    }

    // Verifikasi kode
    const result = await authService.verifyCode(email, code);

    res.status(200).json({
      message: "Kode verifikasi valid.",
      token: result.token
    });
  } catch (err) {
    console.error("Error in verifyCode controller:", err);
    res.status(err.status || 500).json({ message: err.message || "Gagal memverifikasi kode." });
  }
};

// Fungsi untuk reset password
exports.resetPassword = async (req, res) => {
  const { password } = req.body;

  // Log semua headers untuk debugging
  console.log("Headers received:", req.headers);

  // Coba ambil token dari berbagai kemungkinan format
  let token = null;

  if (req.headers["authorization"]) {
    console.log("Authorization header found:", req.headers["authorization"]);
    // Format: "Bearer [token]"
    token = req.headers["authorization"].split(" ")[1];
  } else if (req.headers["Authorization"]) {
    console.log("Authorization header found (case sensitive):", req.headers["Authorization"]);
    // Format: "Bearer [token]"
    token = req.headers["Authorization"].split(" ")[1];
  } else if (req.body.token) {
    // Alternatif: token dikirim di body
    console.log("Token found in body");
    token = req.body.token;
  } else if (req.params && req.params.token) {
    // Alternatif: token dikirim di URL
    console.log("Token found in URL params");
    token = req.params.token;
  }

  console.log("Extracted token:", token);

  if (!token) {
    return res.status(400).json({ message: "Token tidak ditemukan. Pastikan Anda mengirim header 'Authorization: Bearer [token]'" });
  }

  try {
    // Validasi format token
    if (!token || typeof token !== 'string' || !token.includes('.')) {
      console.error("Invalid token format:", token);
      return res.status(400).json({ message: "Format token tidak valid" });
    }

    // Cek apakah token memiliki 3 bagian (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error("Token does not have 3 parts:", parts.length);
      return res.status(400).json({ message: "Format token tidak valid (harus memiliki 3 bagian)" });
    }

    console.log("Token parts:", parts.length);

    // Verifikasi token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
      console.log("Token decoded successfully:", decoded); // Log untuk debugging
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return res.status(401).json({ message: jwtError.message || "Token tidak valid" });
    }

    // Cari pengguna berdasarkan id dari token
    const user = await User.findOne({ where: { id: decoded.userId } });

    if (!user) {
      console.log(`User with ID ${decoded.userId} not found`); // Log untuk debugging
      return res.status(404).json({ message: "Pengguna tidak ditemukan" });
    }

    console.log(`User found: ${user.email}`); // Log untuk debugging

    // Hash kata sandi baru
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Password hashed successfully"); // Log untuk debugging

    // Update kata sandi di database
    user.password = hashedPassword;
    await user.save();

    console.log("Password updated successfully"); // Log untuk debugging

    res.status(200).json({ message: "Kata sandi berhasil diperbarui" });
  } catch (err) {
    console.error("Error in resetPassword:", err); // Log untuk debugging
    res.status(500).json({ message: err.message || "Gagal memperbarui kata sandi" });
  }
};

// Endpoint untuk refresh token
exports.refreshToken = (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token wajib diisi.' });
  }
  try {
    const newAccessToken = authService.refreshAccessToken(refreshToken);
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(401).json({ message: err.message || 'Refresh token tidak valid.' });
  }
};
