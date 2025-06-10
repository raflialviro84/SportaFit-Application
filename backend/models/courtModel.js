// server/models/courtModel.js
const { DataTypes } = require("sequelize");
const db = require("../db");
const Arena = require("./arenaModel");

// Definisikan model Court (Lapangan)
const Court = db.define("courts", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  arena_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Arena,
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING, // misalnya: "badminton", "basket", dll
    allowNull: true,
  },
  price_per_hour: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("active", "maintenance", "inactive"),
    defaultValue: "active",
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false,
  tableName: 'courts'
});

// Definisikan relasi
Court.belongsTo(Arena, { foreignKey: 'arena_id' });
Arena.hasMany(Court, { foreignKey: 'arena_id' });

module.exports = Court;
