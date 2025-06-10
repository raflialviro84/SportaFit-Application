// server/services/authService.js
const bcrypt    = require("bcryptjs");
const jwt       = require("jsonwebtoken");
const userModel = require("../models/userModel");
require("dotenv").config();

// Fungsi register
async function register({ name, email, password, phone }) {
  try {
    // Cek email sudah terdaftar?
    const existing = await userModel.findOne({ where: { email } });
    if (existing) {
      const err = new Error("Email sudah terdaftar.");
      err.status = 409;
      throw err;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user baru
    await userModel.create({
      name,
      email,
      password: hashedPassword,
      phone
    });

    return { success: true };
  } catch (error) {
    console.error(`Error in register service: ${error.message}`);
    throw error;
  }
}

// Penyimpanan refresh token (in-memory, untuk produksi sebaiknya di DB/Redis)
const refreshTokens = new Map();

function generateRefreshToken(userId) {
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    { expiresIn: '30d' }
  );
  refreshTokens.set(refreshToken, userId);
  return refreshToken;
}

function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key');
    if (refreshTokens.has(token)) {
      return decoded;
    }
    throw new Error('Refresh token tidak valid');
  } catch {
    throw new Error('Refresh token tidak valid');
  }
}

// Fungsi login
async function login({ email, password }) {
  try {
    // Cek user ada?
    const user = await userModel.findOne({ where: { email } });
    if (!user) {
      const err = new Error("Email tidak terdaftar");
      err.status = 401;
      throw err;
    }

    // Cek password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      const err = new Error("Email atau Password Salah");
      err.status = 401;
      throw err;
    }

    // Buat JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "15m" } // access token lebih pendek
    );
    // Buat refresh token
    const refreshToken = generateRefreshToken(user.id);

    // Return user (tanpa password dan pin) + token
    const userData = user.toJSON();
    delete userData.password;
    delete userData.pin; // Jangan kirim PIN ke client

    return {
      ...userData,
      token,
      refreshToken
    };
  } catch (error) {
    console.error(`Error in login service: ${error.message}`);
    throw error;
  }
}

// Fungsi untuk menghasilkan kode verifikasi 5 digit
function generateVerificationCode() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

// Simpan kode verifikasi sementara (dalam produksi, gunakan database atau Redis)
const verificationCodes = new Map();

// Fungsi untuk mengirim email reset password
async function forgotPassword(email) {
  try {
    // 1) Cek apakah user ada dengan Sequelize
    const user = await userModel.findOne({ where: { email } });

    // Jika tidak ada hasil, berarti email tidak terdaftar
    if (!user) {
      console.log(`Email not found: ${email}`);
      const err = new Error("Email tidak terdaftar.");
      err.status = 404;
      throw err;
    }

    console.log(`User found: ${user.name} (${user.email})`);

    // 2) Generate token reset password
    const resetToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: '1h' }
    );

    // 3) Generate kode verifikasi 5 digit
    const verificationCode = generateVerificationCode();

    // 4) Simpan kode verifikasi dan token untuk email ini
    verificationCodes.set(email, {
      code: verificationCode,
      token: resetToken,
      expires: Date.now() + 3600000 // 1 jam
    });

    // 5) Log untuk debugging (dalam implementasi nyata, kirim email)
    console.log(`Reset token for ${email}: ${resetToken}`);
    console.log(`Verification code for ${email}: ${verificationCode}`);

    // 6) Return success (untuk simulasi)
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      resetToken,
      verificationCode
    };
  } catch (error) {
    console.error(`Error in forgotPassword service: ${error.message}`);
    throw error;
  }
}

// Fungsi untuk verifikasi kode
async function verifyCode(email, code) {
  try {
    // Cek apakah ada kode verifikasi untuk email ini
    const verification = verificationCodes.get(email);

    if (!verification) {
      const err = new Error("Kode verifikasi tidak ditemukan atau sudah kadaluarsa.");
      err.status = 404;
      throw err;
    }

    // Cek apakah kode sudah kadaluarsa
    if (verification.expires < Date.now()) {
      verificationCodes.delete(email); // Hapus kode kadaluarsa
      const err = new Error("Kode verifikasi sudah kadaluarsa.");
      err.status = 401;
      throw err;
    }

    // Cek apakah kode sesuai
    if (verification.code !== code) {
      const err = new Error("Kode verifikasi tidak valid.");
      err.status = 401;
      throw err;
    }

    // Kode valid, kembalikan token reset
    const token = verification.token;

    // Log token untuk debugging
    console.log(`Valid verification code for ${email}. Token:`, token);

    // Validasi format token
    if (!token || typeof token !== 'string' || !token.includes('.')) {
      console.error("Invalid token format in verification:", token);

      // Generate token baru jika yang lama tidak valid
      const user = await userModel.findOne({ where: { email } });
      if (!user) {
        throw new Error("Pengguna tidak ditemukan");
      }

      const newToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: '1h' }
      );

      console.log(`Generated new token for ${email}:`, newToken);

      // Hapus kode verifikasi setelah digunakan
      verificationCodes.delete(email);

      return {
        success: true,
        token: newToken
      };
    }

    // Hapus kode verifikasi setelah digunakan
    verificationCodes.delete(email);

    return {
      success: true,
      token
    };
  } catch (error) {
    console.error(`Error in verifyCode service: ${error.message}`);
    throw error;
  }
}

// Fungsi untuk refresh token
function refreshAccessToken(refreshToken) {
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '15m' }
    );
    return newAccessToken;
  } catch (e) {
    throw e;
  }
}

// Export semua fungsi
module.exports = {
  register,
  login,
  forgotPassword,
  verifyCode,
  generateRefreshToken,
  verifyRefreshToken,
  refreshAccessToken
};
