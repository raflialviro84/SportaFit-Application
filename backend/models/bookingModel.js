// server/models/bookingModel.js
const { DataTypes } = require("sequelize");
const db = require("../db");
const User = require("./userModel");
const Court = require("./courtModel");
const Arena = require("./arenaModel"); // Added Arena model

// Definisikan model Booking
const Booking = db.define("bookings", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  court_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Court,
      key: 'id'
    }
  },
  arena_id: { // Added arena_id
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Arena,
      key: 'id'
    }
  },
  booking_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  time_slots_details: { // Added time_slots_details
    type: DataTypes.TEXT, // Using TEXT for potentially long JSON string
    allowNull: true,
  },
  total_price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  service_fee: { // Added service_fee
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  discount_amount: { // Added discount_amount
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  protection_fee: { // Added protection_fee
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  final_total_amount: { // Added final_total_amount
    type: DataTypes.INTEGER,
    allowNull: true, // Will be calculated, but can be null before calculation
  },
  status: {
    type: DataTypes.ENUM("pending", "confirmed", "cancelled", "completed", "expired", "cancelled_by_system"), // Added "expired", "cancelled_by_system"
    defaultValue: "pending",
  },
  payment_status: {
    type: DataTypes.ENUM("unpaid", "paid", "refunded", "failed"), // Added "failed"
    defaultValue: "unpaid",
  },
  payment_method: { // Added payment_method
    type: DataTypes.STRING,
    allowNull: true,
  },
  payment_gateway_transaction_id: { // Added payment_gateway_transaction_id
    type: DataTypes.STRING,
    allowNull: true,
  },
  invoice_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  expiry_time: { // Added expiry_time
    type: DataTypes.DATE,
    allowNull: true,
  },
  activity: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  protection_status: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  applied_voucher_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  // Other model options
  timestamps: true, // Enable timestamps
  createdAt: 'created_at', // Map createdAt to created_at
  updatedAt: 'updated_at', // Map updatedAt to updated_at
  hooks: {
    beforeCreate: (booking) => {
      if (booking.created_at) {
        const expiryTime = new Date(booking.created_at);
        expiryTime.setMinutes(expiryTime.getMinutes() + 10); // Ubah ke 10 menit dari waktu pembuatan
        booking.expiry_time = expiryTime;
      }
    },
    beforeUpdate: (booking) => {
      // If created_at is being changed and expiry_time was based on the old created_at
      if (booking.changed('created_at') && booking.created_at) {
         const expiryTime = new Date(booking.created_at);
         expiryTime.setMinutes(expiryTime.getMinutes() + 10); // Ubah ke 10 menit dari waktu pembuatan
         booking.expiry_time = expiryTime;
      }
      booking.updated_at = new Date(); // Manually update updated_at on every update
    }
  }
});

// Define associations for Booking
Booking.belongsTo(Court, { foreignKey: 'court_id', as: 'court' });
Booking.belongsTo(Arena, { foreignKey: 'arena_id', as: 'arena' });
Booking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Sinkronkan model dengan database
(async () => {
  try {
    await Booking.sync({ alter: true }); 
    console.log("Model Booking berhasil disinkronkan dengan database.");
  } catch (error) {
    console.error("Gagal menyinkronkan model Booking dengan database:", error);
  }
})();

module.exports = Booking;
