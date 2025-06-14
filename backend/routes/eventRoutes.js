// server/routes/eventRoutes.js
const router = require('express').Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware'); // Optional: if you want to protect this route

// GET /api/events - Subscribe to Server-Sent Events
// authMiddleware can be added if only authenticated users should subscribe
router.get('/', authMiddleware, eventController.subscribeToEvents);

module.exports = router;
