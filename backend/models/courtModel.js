// server/models/courtModel.js
const { DataTypes } = require("sequelize");
const db = require("../db");

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
      model: 'arenas',  // Use string reference instead of model object
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
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

// Remove direct associations - they will be handled in associations.js
module.exports = Court;
