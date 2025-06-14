// server/routes/bookingRoutes.js
const router = require('express').Router();
const bookingController = require('../controllers/bookingController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// GET /api/bookings/available-slots - Get available slots for a court on a specific date
router.get('/available-slots', bookingController.getAvailableSlots);

// GET /api/bookings/courts - Get courts by arena ID with availability info
router.get('/courts', bookingController.getCourtsByArenaWithAvailability);



// Admin routes - must be defined before generic routes
// GET /api/bookings/admin/stats - Get dashboard statistics for admin
router.get('/admin/stats', adminMiddleware, bookingController.getDashboardStats);

// GET /api/bookings/admin/arena-stats - Get arena statistics for admin
router.get('/admin/arena-stats', adminMiddleware, bookingController.getArenaStats);

// GET /api/bookings/admin/chart-data - Get chart data for admin dashboard with date filtering
router.get('/admin/chart-data', adminMiddleware, bookingController.getChartData);

// GET /api/bookings/admin/all - Get all bookings for admin management
router.get('/admin/all', adminMiddleware, bookingController.getAllBookingsAdmin);

// PUT /api/bookings/admin/:invoiceNumber/status - Update booking status by admin
router.put('/admin/:invoiceNumber/status', adminMiddleware, bookingController.updateBookingStatusAdmin);

// GET /api/bookings/admin/:invoiceNumber - Get booking detail for admin
router.get('/admin/:invoiceNumber', adminMiddleware, bookingController.getBookingDetailAdmin);

// User routes
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
