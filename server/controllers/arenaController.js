// server/controllers/arenaController.js
const Arena = require('../models/arenaModel');
const Court = require('../models/courtModel');
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
      include: [{ model: Court }]
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
