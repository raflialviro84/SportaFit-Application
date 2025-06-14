// server/routes/transactionRoutes.js
const router = require('express').Router();
const bookingController = require('../controllers/bookingController');
const { authMiddleware } = require('../middleware/authMiddleware');

// GET /api/transactions - Get all transactions for the authenticated user
router.get('/', authMiddleware, bookingController.getTransactions);

module.exports = router;
