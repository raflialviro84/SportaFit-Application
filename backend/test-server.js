const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test routes
app.get('/', (req, res) => {
  res.json({ message: 'SportaFit Backend Test Server Running!' });
});

// Mock voucher routes
app.get('/api/vouchers', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        code: 'LEBARAN2024',
        title: 'Diskon Hari Raya',
        description: 'Diskon spesial untuk hari raya',
        discountType: 'percentage',
        discountValue: 25,
        maxDiscount: 50000,
        minPurchase: 100000,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        isActive: true,
        usedCount: 15,
        totalUsers: 156,
        usageLimit: 100,
        imageUrl: null
      },
      {
        id: 2,
        code: 'NEWUSER50',
        title: 'Diskon Pengguna Baru',
        description: 'Diskon untuk pengguna baru',
        discountType: 'fixed',
        discountValue: 50000,
        maxDiscount: null,
        minPurchase: 200000,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        isActive: true,
        usedCount: 8,
        totalUsers: 156,
        usageLimit: 50,
        imageUrl: null
      }
    ],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 2
    }
  });
});

app.post('/api/vouchers', (req, res) => {
  res.json({
    success: true,
    message: 'Voucher berhasil dibuat',
    data: {
      id: 3,
      ...req.body,
      createdAt: new Date().toISOString()
    }
  });
});

app.get('/api/vouchers/:id', (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.params.id,
      code: 'LEBARAN2024',
      title: 'Diskon Hari Raya',
      description: 'Diskon spesial untuk hari raya',
      discountType: 'percentage',
      discountValue: 25,
      maxDiscount: 50000,
      minPurchase: 100000,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      isActive: true,
      usedCount: 15,
      totalUsers: 156,
      usageLimit: 100,
      imageUrl: null
    }
  });
});

app.put('/api/vouchers/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Voucher berhasil diupdate',
    data: {
      id: req.params.id,
      ...req.body,
      updatedAt: new Date().toISOString()
    }
  });
});

app.delete('/api/vouchers/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Voucher berhasil dihapus'
  });
});

// Mock admin auth routes
app.post('/api/auth/admin/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login berhasil',
    token: 'mock-admin-token-12345',
    user: {
      id: 1,
      email: 'admin@sportafit.com',
      name: 'Admin User',
      role: 'admin'
    }
  });
});

// Mock stats routes
app.get('/api/bookings/admin/stats', (req, res) => {
  res.json({
    success: true,
    stats: {
      totalRevenue: 15000000,
      totalBookings: 125,
      totalArenas: 8,
      totalUsers: 156
    },
    recentBookings: []
  });
});

app.get('/api/users/admin/count', (req, res) => {
  res.json({
    success: true,
    total: 156,
    recent: []
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Test Server running on http://localhost:${port}`);
  console.log(`📊 Admin Dashboard: http://localhost:${port}/admin`);
  console.log(`🎫 Voucher API: http://localhost:${port}/api/vouchers`);
});
