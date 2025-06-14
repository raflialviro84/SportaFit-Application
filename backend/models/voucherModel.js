// server/models/voucherModel.js
const { DataTypes, Op } = require("sequelize");
const db = require("../db");
const User = require("./userModel");

// Definisikan model Voucher
const Voucher = db.define("vouchers", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  discount_type: {
    type: DataTypes.ENUM('percentage', 'fixed'),
    allowNull: false
  },
  discount_value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  min_purchase: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  max_discount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  image_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  usage_limit: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  usage_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false,
  tableName: 'vouchers'
});

// Definisikan model UserVoucher untuk relasi many-to-many
const UserVoucher = db.define("user_vouchers", {
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
  voucher_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Voucher,
      key: 'id'
    }
  },
  is_used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  used_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false,
  tableName: 'user_vouchers'
});

// Definisikan relasi
User.belongsToMany(Voucher, { through: UserVoucher, foreignKey: 'user_id', as: 'Vouchers' });
Voucher.belongsToMany(User, { through: UserVoucher, foreignKey: 'voucher_id', as: 'Users' });

// Relasi langsung untuk UserVoucher
UserVoucher.belongsTo(User, { foreignKey: 'user_id' });
UserVoucher.belongsTo(Voucher, { foreignKey: 'voucher_id', as: 'voucher' }); // Lowercase alias to match error message
User.hasMany(UserVoucher, { foreignKey: 'user_id' });
Voucher.hasMany(UserVoucher, { foreignKey: 'voucher_id', as: 'user_vouchers' }); // Use snake_case for consistency

// Fungsi untuk mendapatkan semua voucher
Voucher.getAllVouchers = async function() {
  try {
    const now = new Date();
    const vouchers = await Voucher.findAll({
      where: { 
        is_active: true,
        start_date: { [Op.lte]: now },  // Start date is less than or equal to now
        end_date: { [Op.gte]: now }     // End date is greater than or equal to now
      },
      order: [['created_at', 'DESC']]
    });
    return vouchers;
  } catch (error) {
    console.error(`Error in getAllVouchers: ${error.message}`);
    throw error;
  }
};

// Fungsi untuk mendapatkan voucher berdasarkan ID
Voucher.getVoucherById = async function(id) {
  try {
    const voucher = await Voucher.findByPk(id);
    return voucher;
  } catch (error) {
    console.error(`Error in getVoucherById: ${error.message}`);
    throw error;
  }
};

// Fungsi untuk mendapatkan voucher berdasarkan kode
Voucher.getVoucherByCode = async function(code) {
  try {
    const voucher = await Voucher.findOne({
      where: { code: code, is_active: true }
    });
    return voucher;
  } catch (error) {
    console.error(`Error in getVoucherByCode: ${error.message}`);
    throw error;
  }
};

// Fungsi untuk mendapatkan voucher yang dimiliki oleh user
Voucher.getVouchersByUserId = async function(userId) {
  try {
    console.log(`Fetching vouchers for user ${userId} using direct join query`);
    // Use a direct join query instead of relying on Sequelize associations
    const userVouchers = await UserVoucher.findAll({
      where: { user_id: userId },
      include: [{
        model: Voucher,
        as: 'voucher', // Using lowercase alias to match the association
        where: { is_active: true },
        required: true
      }]
    });
    
    console.log(`Found ${userVouchers.length} user vouchers records`);
    
    // Map UserVoucher instances to Voucher objects with additional is_used property
    const vouchers = userVouchers.map(uv => {
      const voucher = uv.voucher; // Use the lowercase alias
      if (!voucher) {
        console.log(`No voucher data found for UserVoucher ID ${uv.id}`);
        return null;
      }
      
      // Add user_voucher properties to the voucher object
      voucher.isUsed = uv.is_used;
      voucher.usedAt = uv.used_at;
      
      return voucher;
    }).filter(v => v !== null); // Remove null entries
    
    return vouchers;
  } catch (error) {
    console.error(`Error in getVouchersByUserId: ${error.message}`);
    throw error;
  }
};

// Fungsi untuk menambahkan voucher ke user
Voucher.addVoucherToUser = async function(userId, voucherId) {
  try {
    const [userVoucher, created] = await UserVoucher.findOrCreate({
      where: { user_id: userId, voucher_id: voucherId },
      defaults: { is_used: false }
    });
    
    if (!created) {
      throw new Error('User already has this voucher');
    }
    
    return userVoucher;
  } catch (error) {
    console.error(`Error in addVoucherToUser: ${error.message}`);
    throw error;
  }
};

// Fungsi untuk menggunakan voucher
Voucher.useVoucher = async function(userId, voucherId) {
  try {
    const userVoucher = await UserVoucher.findOne({
      where: { user_id: userId, voucher_id: voucherId, is_used: false }
    });
    
    if (!userVoucher) {
      throw new Error('Voucher not found or already used');
    }
    
    // Update status voucher menjadi sudah digunakan
    userVoucher.is_used = true;
    userVoucher.used_at = new Date();
    await userVoucher.save();
    
    // Increment usage_count pada voucher
    const voucher = await Voucher.findByPk(voucherId);
    voucher.usage_count += 1;
    await voucher.save();
    
    return userVoucher;
  } catch (error) {
    console.error(`Error in useVoucher: ${error.message}`);
    throw error;
  }
};

module.exports = { Voucher, UserVoucher };
