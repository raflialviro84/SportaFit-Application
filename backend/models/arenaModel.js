// server/models/arenaModel.js
const { DataTypes } = require("sequelize");
const db = require("../db");

// Definisikan model Arena
const Arena = db.define("arenas", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: { // Added category field
    type: DataTypes.STRING,
    allowNull: true, // Or false if it's a required field
  },
  images: { // Added images field
    type: DataTypes.TEXT, // Storing as TEXT, assuming JSON array of image URLs
    allowNull: true,
    get() {
      const value = this.getDataValue('images');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('images', JSON.stringify(value));
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  opening_hours: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  rating: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0,
  },
  reviews_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  price_per_hour: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("active", "maintenance", "inactive"),
    defaultValue: "active",
  },
  facilities: {
    type: DataTypes.TEXT, // Akan disimpan sebagai JSON string
    allowNull: true,
    get() {
      const value = this.getDataValue('facilities');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('facilities', JSON.stringify(value));
    }
  },
  policies: {
    type: DataTypes.TEXT, // Akan disimpan sebagai JSON string
    allowNull: true,
    get() {
      const value = this.getDataValue('policies');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('policies', JSON.stringify(value));
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false,
  tableName: 'arenas'
});

module.exports = Arena;
