// Initialize all model associations
const initializeAssociations = () => {
  try {
    console.log('Initializing model associations...');
    
    // Import all models after they are fully defined
    const User = require('./userModel');
    const Arena = require('./arenaModel');
    const Court = require('./courtModel');
    const Booking = require('./bookingModel');
    const Notification = require('./notificationModel');
    
    // Import voucher models
    let Voucher, UserVoucher;
    try {
      const voucherModels = require('./voucherModel');
      Voucher = voucherModels.Voucher;
      UserVoucher = voucherModels.UserVoucher;
      console.log('Voucher models imported successfully');
    } catch (voucherError) {
      console.warn('Warning: Voucher models could not be imported:', voucherError.message);
      console.warn('Voucher functionality will be disabled');
    }

    console.log('Models imported successfully');

    // Clear existing associations to avoid conflicts
    User.associations = {};
    Arena.associations = {};
    Court.associations = {};
    Booking.associations = {};
    Notification.associations = {};
    
    // Clear voucher associations if models exist
    if (Voucher) Voucher.associations = {};
    if (UserVoucher) UserVoucher.associations = {};

    // User associations
    User.hasMany(Booking, { 
      foreignKey: 'user_id', 
      as: 'bookings',
      onDelete: 'CASCADE'
    });
    
    // User-Notification association
    User.hasMany(Notification, {
      foreignKey: 'userId',
      as: 'notifications',
      onDelete: 'CASCADE'
    });
    
    // Notification-User association
    Notification.belongsTo(User, {
      foreignKey: 'userId',
      as: 'user',
      targetKey: 'id'
    });

    // Arena associations  
    Arena.hasMany(Court, { 
      foreignKey: 'arena_id', 
      as: 'courts',
      onDelete: 'CASCADE'
    });

    // Court associations
    Court.belongsTo(Arena, { 
      foreignKey: 'arena_id', 
      as: 'arena',
      targetKey: 'id'
    });
    
    Court.hasMany(Booking, { 
      foreignKey: 'court_id', 
      as: 'bookings',
      onDelete: 'CASCADE'
    });

    // Booking associations
    Booking.belongsTo(User, { 
      foreignKey: 'user_id', 
      as: 'user',
      targetKey: 'id'
    });
    
    Booking.belongsTo(Arena, { 
      foreignKey: 'arena_id', 
      as: 'arena',
      targetKey: 'id'
    });
    
    Booking.belongsTo(Court, { 
      foreignKey: 'court_id', 
      as: 'court',
      targetKey: 'id'
    });

    // Setup voucher associations if voucher models exist
    if (Voucher && UserVoucher) {
      try {
        // Voucher-User associations through UserVoucher
        User.belongsToMany(Voucher, {
          through: UserVoucher,
          foreignKey: 'user_id',
          otherKey: 'voucher_id',
          as: 'vouchers'
        });
        
        Voucher.belongsToMany(User, {
          through: UserVoucher,
          foreignKey: 'voucher_id',
          otherKey: 'user_id',
          as: 'users'
        });
        
        UserVoucher.belongsTo(User, {
          foreignKey: 'user_id',
          as: 'user'
        });
        
        UserVoucher.belongsTo(Voucher, {
          foreignKey: 'voucher_id',
          as: 'voucher'
        });
        
        User.hasMany(UserVoucher, {
          foreignKey: 'user_id',
          as: 'userVouchers'
        });
        
        Voucher.hasMany(UserVoucher, {
          foreignKey: 'voucher_id',
          as: 'userVouchers'
        });
        
        // Optional: Booking-Voucher association if you want to track which voucher was used for a booking
        Booking.belongsTo(Voucher, {
          foreignKey: 'applied_voucher_id', // Mengubah dari 'voucher_id' ke 'applied_voucher_id'
          as: 'voucher',
          targetKey: 'id'
        });
        
        console.log('Voucher associations initialized successfully');
      } catch (voucherAssociationError) {
        console.error('Error initializing voucher associations:', voucherAssociationError);
        // Don't throw here, continue with other associations
      }
    }

    console.log('All model associations initialized successfully');
    
    // Log association counts for verification
    console.log('User associations:', Object.keys(User.associations).length);
    console.log('Arena associations:', Object.keys(Arena.associations).length);
    console.log('Court associations:', Object.keys(Court.associations).length);
    console.log('Booking associations:', Object.keys(Booking.associations).length);
    console.log('Notification associations:', Object.keys(Notification.associations).length);
    if (Voucher) console.log('Voucher associations:', Object.keys(Voucher.associations).length);
    if (UserVoucher) console.log('UserVoucher associations:', Object.keys(UserVoucher.associations).length);
    
  } catch (error) {
    console.error('Error initializing associations:', error);
    throw error;
  }
};

module.exports = { initializeAssociations };