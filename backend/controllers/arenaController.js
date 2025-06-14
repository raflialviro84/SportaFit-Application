// server/controllers/arenaController.js
const Arena = require('../models/arenaModel');
const Court = require('../models/courtModel');
const Booking = require('../models/bookingModel');
const { Op } = require('sequelize');

// Get all arenas
exports.getAllArenas = async (req, res) => {
  try {
    const { search, city } = req.query;
    
    // Build query conditions
    const whereConditions = {};
    
    if (search) {
      whereConditions.name = {
        [Op.like]: `%${search}%`
      };
    }
    
    if (city) {
      whereConditions.city = city;
    }
    
    const arenas = await Arena.findAll({
      where: whereConditions,
      order: [['rating', 'DESC']]
    });
    
    res.json(arenas);
  } catch (error) {
    console.error('Error getting arenas:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get arena by ID
exports.getArenaById = async (req, res) => {
  try {
    const { id } = req.params;

    const arena = await Arena.findByPk(id, {
      include: [{
        model: Court,
        as: 'courts'
      }]
    });

    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }

    res.json(arena);
  } catch (error) {
    console.error('Error getting arena:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get courts by arena ID
exports.getCourtsByArenaId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const courts = await Court.findAll({
      where: { arena_id: id },
      order: [['name', 'ASC']]
    });
    
    res.json(courts);
  } catch (error) {
    console.error('Error getting courts:', error);
    res.status(500).json({ message: error.message });
  }
};

// Search arenas
exports.searchArenas = async (req, res) => {
  try {
    const { query, city } = req.query;
    
    const whereConditions = {};
    
    if (query) {
      whereConditions[Op.or] = [
        { name: { [Op.like]: `%${query}%` } },
        { address: { [Op.like]: `%${query}%` } },
        { description: { [Op.like]: `%${query}%` } }
      ];
    }
    
    if (city) {
      whereConditions.city = city;
    }
    
    const arenas = await Arena.findAll({
      where: whereConditions,
      order: [['rating', 'DESC']]
    });
    
    res.json(arenas);
  } catch (error) {
    console.error('Error searching arenas:', error);
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get all arenas with detailed stats
exports.getAllArenasAdmin = async (req, res) => {
  try {
    const { search, city, status, sortBy = 'name', sortOrder = 'asc' } = req.query;

    // Build query conditions
    const whereConditions = {};

    if (search) {
      whereConditions[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } }
      ];
    }

    if (city && city !== 'Semua Kota') {
      whereConditions.city = city;
    }

    if (status && status !== 'Semua Status') {
      whereConditions.status = status;
    }

    const arenas = await Arena.findAll({
      where: whereConditions,
      include: [
        {
          model: Court,
          as: 'courts',
          required: false,
          attributes: ['id', 'name', 'status'],
          include: [
            {
              model: Booking,
              as: 'bookings',
              required: false,
              where: {
                payment_status: 'paid',
                status: { [Op.in]: ['confirmed', 'completed'] }
              },
              attributes: ['id', 'final_total_amount']
            }
          ]
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]]
    });

    // Calculate stats for each arena
    const arenasWithStats = arenas.map(arena => {
      const courts = arena.courts || [];
      const allBookings = courts.flatMap(court => court.bookings || []);
      const totalBookings = allBookings.length;
      const totalRevenue = allBookings.reduce((sum, booking) => {
        return sum + (parseFloat(booking.final_total_amount) || 0);
      }, 0);

      return {
        id: arena.id,
        name: arena.name,
        address: arena.address,
        city: arena.city,
        image_url: arena.image_url,
        rating: arena.rating || 0,
        reviews_count: arena.reviews_count || 0,
        opening_hours: arena.opening_hours,
        price_per_hour: arena.price_per_hour,
        status: arena.status || 'active',
        courts_count: courts.length,
        facilities: arena.facilities || [],
        created_at: arena.created_at,
        total_bookings: totalBookings,
        total_revenue: totalRevenue
      };
    });

    res.json(arenasWithStats);
  } catch (error) {
    console.error('Error getting arenas for admin:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update arena
exports.updateArena = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const arena = await Arena.findByPk(id);
    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }

    // Validate status if provided
    if (updateData.status && !['active', 'maintenance', 'inactive'].includes(updateData.status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    await arena.update(updateData);

    res.json({
      success: true,
      message: 'Arena updated successfully',
      data: arena
    });
  } catch (error) {
    console.error('Error updating arena:', error);
    res.status(500).json({ message: error.message });
  }
};

// Admin: Update arena status
exports.updateArenaStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'maintenance', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const arena = await Arena.findByPk(id);
    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }

    await arena.update({ status });

    res.json({
      success: true,
      message: 'Arena status updated successfully',
      data: arena
    });
  } catch (error) {
    console.error('Error updating arena status:', error);
    res.status(500).json({ message: error.message });
  }
};

// Admin: Delete arena
exports.deleteArena = async (req, res) => {
  try {
    const { id } = req.params;

    const arena = await Arena.findByPk(id);
    if (!arena) {
      return res.status(404).json({ message: 'Arena not found' });
    }

    // Check if arena has active bookings
    const activeBookings = await Booking.count({
      where: {
        arena_id: id,
        status: { [Op.in]: ['pending', 'confirmed'] },
        payment_status: 'paid'
      }
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        message: 'Cannot delete arena with active bookings'
      });
    }

    await arena.destroy();

    res.json({
      success: true,
      message: 'Arena deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting arena:', error);
    res.status(500).json({ message: error.message });
  }
};
