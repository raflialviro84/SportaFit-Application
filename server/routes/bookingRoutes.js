// server/routes/bookingRoutes.js
const router = require('express').Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/bookings/available-slots - Get available slots for a court on a specific date
router.get('/available-slots', bookingController.getAvailableSlots);

// GET /api/bookings/courts - Get courts by arena ID with availability info
router.get('/courts', bookingController.getCourtsByArenaWithAvailability);

// POST /api/bookings - Create a new booking (wajib login)
router.post('/', authMiddleware, bookingController.createBooking);

// GET /api/bookings/user/me - Get bookings for the authenticated user (wajib login)
router.get('/user/me', authMiddleware, bookingController.getMyBookings);

// PUT /api/bookings/:invoiceNumber - Update booking status (wajib login)
router.put('/:invoiceNumber', authMiddleware, bookingController.updateBookingStatus);

// GET /api/bookings/:invoiceNumber - Get booking details by invoice number (wajib login)
router.get('/:invoiceNumber', authMiddleware, bookingController.getBookingByInvoice);

// GET /api/transactions - Get all transactions for the authenticated user
router.get('/transactions', authMiddleware, bookingController.getTransactions);

module.exports = router;
