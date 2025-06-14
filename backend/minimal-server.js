const express = require('express');
const cors = require('cors');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'SportaFit Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Voucher routes
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
      }
    ],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 1
    }
  });
});

app.post('/api/vouchers', (req, res) => {
  res.json({
    success: true,
    message: 'Voucher berhasil dibuat',
    data: {
      id: Date.now(),
      ...req.body,
      createdAt: new Date().toISOString()
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`🎫 Voucher API: http://localhost:${port}/api/vouchers`);
});

// Handle errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
