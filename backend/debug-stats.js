const { Booking, User, Court, Arena } = require('./models');
const { Op } = require('sequelize');

async function debugStats() {
  try {
    console.log('🔍 Debugging recent bookings...');
    
    // Get recent bookings with user data
    const recentBookings = await Booking.findAll({
      include: [
        {
          model: Court,
          as: 'court',
          attributes: ['id', 'name'],
          required: false,
          include: [
            {
              model: Arena,
              as: 'arena',
              attributes: ['id', 'name'],
              required: false
            }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 5,
      where: {
        user_id: { [Op.ne]: null },
        court_id: { [Op.ne]: null },
        arena_id: { [Op.ne]: null }
      }
    });

    console.log(`Found ${recentBookings.length} recent bookings`);
    
    recentBookings.forEach((booking, index) => {
      const safeBooking = booking.toJSON ? booking.toJSON() : booking;
      console.log(`\nBooking ${index + 1}:`);
      console.log('- ID:', safeBooking.id);
      console.log('- Invoice:', safeBooking.invoice_number);
      console.log('- User ID:', safeBooking.user_id);
      console.log('- User Object:', safeBooking.user);
      console.log('- User Name:', safeBooking.user?.name);
      console.log('- Arena ID:', safeBooking.arena_id);
      console.log('- Court Object:', safeBooking.court);
      console.log('- Arena Name:', safeBooking.court?.arena?.name);
      console.log('- Amount:', safeBooking.final_total_amount);
      console.log('- Date:', safeBooking.booking_date);
      console.log('- Created:', safeBooking.created_at);
    });

    // Check if users exist
    console.log('\n🔍 Checking users...');
    const userCount = await User.count();
    console.log('Total users:', userCount);
    
    const sampleUsers = await User.findAll({
      limit: 5,
      attributes: ['id', 'name', 'email']
    });
    
    console.log('Sample users:');
    sampleUsers.forEach(user => {
      console.log(`- ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`);
    });

  } catch (error) {
    console.error('Error debugging stats:', error);
  }
}

debugStats();
