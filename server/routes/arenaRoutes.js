// server/routes/arenaRoutes.js
const router = require('express').Router();
const arenaController = require('../controllers/arenaController');

// GET /api/arenas - Get all arenas
router.get('/', arenaController.getAllArenas);

// GET /api/arenas/search - Search arenas
router.get('/search', arenaController.searchArenas);

// GET /api/arenas/:id - Get arena by ID
router.get('/:id', arenaController.getArenaById);

// GET /api/arenas/:id/courts - Get courts by arena ID
router.get('/:id/courts', arenaController.getCourtsByArenaId);

module.exports = router;
