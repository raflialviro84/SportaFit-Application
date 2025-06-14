// server/models/userModel.js
const { DataTypes } = require("sequelize");
const db = require("../db");

// Definisikan model User sesuai dengan struktur tabel di database badminton_reservation
const User = db.define("users", { // Nama tabel harus sesuai dengan database
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true, // Allow null for social login
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  birth_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM("user", "admin"),
    defaultValue: "user",
  },
  pin: {
    type: DataTypes.STRING,
    allowNull: true, // PIN is optional initially
  },
  google_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  facebook_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  twitter_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  photoUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
  // Kolom updated_at dihapus karena tidak ada di database
}, {
  // Opsi tambahan
  timestamps: false, // Jika Anda mengelola created_at dan updated_at secara manual
  tableName: 'users' // Pastikan nama tabel sesuai dengan database
});

// Fungsi untuk mencari user berdasarkan email (untuk kompatibilitas dengan kode lama)
User.findByEmail = async function(email) {
  try {
    const user = await User.findOne({ where: { email } });
    return [user ? [user.toJSON()] : []]; // Format yang kompatibel dengan mysql2
  } catch (error) {
    console.error(`Error in findByEmail: ${error.message}`);
    throw error;
  }
};

// Fungsi untuk membuat user baru (untuk kompatibilitas dengan kode lama)
User.createUser = async function({ name, email, password, phone }) {
  try {
    return await User.create({
      name,
      email,
      password,
      phone,
      role: "user",
      created_at: new Date()
      // updated_at dihapus karena tidak ada di database
    });
  } catch (error) {
    console.error(`Error in createUser: ${error.message}`);
    throw error;
  }
};

// Remove direct associations - they will be handled in associations.js
module.exports = User;
