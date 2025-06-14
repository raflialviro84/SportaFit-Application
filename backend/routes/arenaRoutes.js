// server/routes/arenaRoutes.js
const router = require('express').Router();
const arenaController = require('../controllers/arenaController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Admin routes - must be defined before generic routes
// GET /api/arenas/admin/all - Get all arenas for admin with stats
router.get('/admin/all', adminMiddleware, arenaController.getAllArenasAdmin);

// PUT /api/arenas/admin/:id/status - Update arena status
router.put('/admin/:id/status', adminMiddleware, arenaController.updateArenaStatus);

// DELETE /api/arenas/admin/:id - Delete arena
router.delete('/admin/:id', adminMiddleware, arenaController.deleteArena);

// Public routes
// GET /api/arenas - Get all arenas
router.get('/', arenaController.getAllArenas);

// GET /api/arenas/search - Search arenas
router.get('/search', arenaController.searchArenas);

// GET /api/arenas/:id - Get arena by ID
router.get('/:id', arenaController.getArenaById);

// PUT /api/arenas/:id - Update arena
router.put('/:id', arenaController.updateArena);

// GET /api/arenas/:id/courts - Get courts by arena ID
router.get('/:id/courts', arenaController.getCourtsByArenaId);

module.exports = router;
