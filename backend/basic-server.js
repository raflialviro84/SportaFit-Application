const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  console.log(`${method} ${path}`);

  // Routes
  if (path === '/' && method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ 
      message: 'SportaFit Backend Running!',
      status: 'success',
      timestamp: new Date().toISOString()
    }));
  }
  else if (path === '/api/vouchers' && method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
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
    }));
  }
  else if (path.startsWith('/api/vouchers/admin/all') && method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
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
    }));
  }
  else if (path.startsWith('/api/vouchers/admin/stats') && method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      data: {
        totalVouchers: 12,
        activeVouchers: 8,
        totalUsers: 156,
        totalUsage: 89
      }
    }));
  }
  else if (path === '/api/vouchers' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        message: 'Voucher berhasil dibuat',
        data: {
          id: Date.now(),
          ...JSON.parse(body || '{}'),
          createdAt: new Date().toISOString()
        }
      }));
    });
  }
  else {
    res.writeHead(404);
    res.end(JSON.stringify({
      success: false,
      message: 'Route not found'
    }));
  }
});

const port = 5000;
server.listen(port, () => {
  console.log(`🚀 Basic Server running on http://localhost:${port}`);
  console.log(`🎫 Voucher API: http://localhost:${port}/api/vouchers`);
});

// Handle errors
server.on('error', (err) => {
  console.error('Server error:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
