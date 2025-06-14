import React, { useState, useEffect } from 'react';
import {
  FaUsers,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaEye,
  FaEdit,
  FaPlus,
  FaFilter,
  FaCalendarWeek,
  FaChartBar,
  FaChartLine,
  FaBuilding,
  FaDownload,
  FaSync,
  FaSpinner,
  FaArrowUp,
  FaArrowDown,
  FaPrint
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import AdminLayout from '../../components/AdminLayout';
import { useNotification } from '../../context/NotificationContext';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Period options
const periodOptions = [
  { value: 'today', label: 'Hari Ini' },
  { value: 'yesterday', label: 'Kemarin' },
  { value: 'week', label: 'Minggu Ini' },
  { value: 'month', label: 'Bulan Ini' },
  { value: 'year', label: 'Tahun Ini' },
  { value: 'custom', label: 'Custom' }
];

// Chart type options
const chartTypes = [
  { value: 'revenue', label: 'Pendapatan', icon: FaMoneyBillWave },
  { value: 'bookings', label: 'Booking', icon: FaCalendarAlt },
  { value: 'users', label: 'Pengguna', icon: FaUsers },
  { value: 'arenas', label: 'Arena', icon: FaBuilding }
];

// StatCard Component
const StatCard = ({ title, value, change, changeType, icon: Icon, color, prefix = '', suffix = '' }) => (
  <div className="bg-white p-2 sm:p-3 md:p-4 rounded-lg shadow-sm border border-gray-200">
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-xs md:text-sm text-gray-600 truncate">{title}</p>
        <p className="text-sm sm:text-base md:text-lg font-bold text-gray-900 truncate">
          {prefix}{typeof value === 'number' ? value.toLocaleString('id-ID') : value}{suffix}
        </p>
        {change !== undefined && (
          <div className={`flex items-center mt-1 text-xs ${
            changeType === 'increase' ? 'text-green-600' :
            changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {changeType === 'increase' && <FaArrowUp size={6} className="mr-1" />}
            {changeType === 'decrease' && <FaArrowDown size={6} className="mr-1" />}
            <span className="truncate hidden sm:inline">{Math.abs(change)}% dari periode sebelumnya</span>
            <span className="truncate sm:hidden">{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <div className={`p-1 sm:p-2 md:p-3 rounded-full bg-gray-100 ${color} flex-shrink-0 ml-1`}>
        <Icon size={window.innerWidth < 768 ? 12 : 16} />
      </div>
    </div>
  </div>
);

function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('year'); // Ubah dari 'week' menjadi 'year'
  const [customDateRange, setCustomDateRange] = useState({
    startDate: new Date(2024, 0, 1).toISOString().split('T')[0], // Start from 2024
    endDate: new Date().toISOString().split('T')[0]
  });
  const [activeChart, setActiveChart] = useState('revenue');
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalRevenue: 0,
      totalBookings: 0,
      totalUsers: 0,
      totalArenas: 0,
      percentageChange: {
        revenue: 0,
        bookings: 0,
        users: 0,
        arenas: 0
      }
    },
    chartData: {
      labels: [],
      datasets: []
    },
    topArenas: [],
    recentTransactions: [],
    recentBookings: [],
    recentUsers: []
  });
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { success } = useNotification();

  // Function to calculate date range based on period
  const calculateDateRange = (period) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    switch (period) {
      case 'today':
        return {
          startDate: todayStr,
          endDate: todayStr
        };
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        return {
          startDate: yesterdayStr,
          endDate: yesterdayStr
        };
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7); // Last 7 days
        return {
          startDate: weekStart.toISOString().split('T')[0],
          endDate: todayStr
        };
      case 'month':
        const monthStart = new Date(today);
        monthStart.setMonth(today.getMonth() - 1); // Last 30 days
        return {
          startDate: monthStart.toISOString().split('T')[0],
          endDate: todayStr
        };
      case 'year':
        const yearStart = new Date(today);
        yearStart.setFullYear(today.getFullYear() - 1); // Last 365 days
        return {
          startDate: yearStart.toISOString().split('T')[0],
          endDate: todayStr
        };
      default:
        return {
          startDate: new Date(2024, 0, 1).toISOString().split('T')[0],
          endDate: todayStr
        };
    }
  };

  // Update date range when period changes
  useEffect(() => {
    if (period !== 'custom') {
      const newDateRange = calculateDateRange(period);
      setCustomDateRange(newDateRange);
    }
  }, [period]);

  useEffect(() => {
    fetchDashboardData();
  }, [period, customDateRange, activeChart]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');

      if (!token) {
        setError('Token admin tidak ditemukan. Silakan login ulang.');
        throw new Error('Token admin tidak ditemukan. Silakan login ulang.');
      }

      console.log('Fetching dashboard data with token:', token.substring(0, 20) + '...');

      // Setup header dengan token admin
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch dashboard statistics
      console.log('Fetching stats from:', `/api/bookings/admin/stats?period=${period}&startDate=${customDateRange.startDate}&endDate=${customDateRange.endDate}`);
      console.log('Request Headers:', headers);
      
      // Tambahkan parameter periode ke request stats
      const statsResponse = await fetch(`/api/bookings/admin/stats?period=${period}&startDate=${customDateRange.startDate}&endDate=${customDateRange.endDate}`, {
        headers
      });

      console.log('Stats response status:', statsResponse.status);
      
      if (!statsResponse.ok) {
        const errorText = await statsResponse.text();
        console.error('Stats error response:', errorText);
        
        // Jika 401 Unauthorized atau 403 Forbidden, redirect ke login
        if (statsResponse.status === 401 || statsResponse.status === 403) {
          localStorage.removeItem('adminToken'); // Hapus token yang tidak valid
          setError('Sesi admin berakhir. Silakan login ulang.');
          setTimeout(() => navigate('/admin/login'), 2000);
          throw new Error(`Session expired. Please login again.`);
        }
        
        throw new Error(`Failed to fetch stats: ${statsResponse.status} ${statsResponse.statusText}`);
      }

      const statsData = await statsResponse.json();
      console.log('Stats data received:', statsData);

      // Fetch users count
      console.log('Fetching users count from:', '/api/users/admin/count');
      const usersResponse = await fetch('/api/users/admin/count', {
        headers
      });

      if (!usersResponse.ok) {
        const errorText = await usersResponse.text();
        console.error('Users error response:', errorText);
        throw new Error(`Failed to fetch users: ${usersResponse.status} ${usersResponse.statusText}`);
      }

      const usersData = await usersResponse.json();
      console.log('Users data received:', usersData);

      // Fetch arena statistics
      console.log('Fetching arena stats from:', '/api/bookings/admin/arena-stats');
      const arenaStatsResponse = await fetch('/api/bookings/admin/arena-stats', {
        headers
      });

      let arenaStatsData = { topArenas: [] };
      if (arenaStatsResponse.ok) {
        arenaStatsData = await arenaStatsResponse.json();
        console.log('Arena stats data received:', arenaStatsData);
      } else {
        console.warn('Failed to fetch arena stats:', await arenaStatsResponse.text());
      }

      // Fetch chart data
      console.log('Fetching chart data from:', `/api/bookings/admin/chart-data?period=${period}&startDate=${customDateRange.startDate}&endDate=${customDateRange.endDate}`);
      const chartResponse = await fetch(`/api/bookings/admin/chart-data?period=${period}&startDate=${customDateRange.startDate}&endDate=${customDateRange.endDate}`, {
        headers
      });

      let chartData = generateMockChartData(activeChart);
      if (chartResponse.ok) {
        const chartResult = await chartResponse.json();
        console.log('📊 Chart API response:', chartResult);

        // Process chart data based on API response structure
        if (chartResult && (chartResult.bookingTrends || chartResult.revenueData)) {
          chartData = processRealChartData(chartResult, activeChart);
        } else {
          console.warn('⚠️ Chart data empty, using mock data');
        }
      } else {
        console.warn('⚠️ Chart data API failed, using mock data:', await chartResponse.text());
      }

      // Process the data
      console.log('📊 Raw API Data:');
      console.log('Stats data:', statsData);
      console.log('Users data:', usersData);
      console.log('Arena stats data:', arenaStatsData);
      console.log('Chart data:', chartData);

      const dashboardResult = {
        stats: {
          totalRevenue: parseFloat(statsData.stats?.totalRevenue) || 0,
          totalBookings: parseInt(statsData.stats?.totalBookings) || 0,
          totalUsers: parseInt(statsData.stats?.totalUsers) || 0,
          totalArenas: parseInt(statsData.stats?.totalArenas) || 0,
          percentageChange: {
            revenue: parseInt(statsData.stats?.percentageChange?.revenue) || 0,
            bookings: parseInt(statsData.stats?.percentageChange?.bookings) || 0,
            users: parseInt(statsData.stats?.percentageChange?.users) || 0,
            arenas: parseInt(statsData.stats?.percentageChange?.arenas) || 0
          }
        },
        chartData: chartData,
        topArenas: Array.isArray(arenaStatsData) ? arenaStatsData.map(arena => ({
          name: arena.name,
          bookings: arena.totalBookings,
          revenue: arena.totalRevenue
        })) : [],
        recentTransactions: statsData.recentBookings?.map(booking => {
          console.log('🔍 Processing booking:', booking); // Debug log

          // Try multiple ways to get user name
          let userName = 'User Tidak Diketahui';
          if (booking.user_name) {
            userName = booking.user_name;
          } else if (booking.user && booking.user.name) {
            userName = booking.user.name;
          } else if (booking.User && booking.User.name) {
            userName = booking.User.name;
          }

          // Try multiple ways to get arena name
          let arenaName = 'Arena Tidak Diketahui';
          if (booking.arena_name) {
            arenaName = booking.arena_name;
          } else if (booking.court && booking.court.arena && booking.court.arena.name) {
            arenaName = booking.court.arena.name;
          } else if (booking.Court && booking.Court.Arena && booking.Court.Arena.name) {
            arenaName = booking.Court.Arena.name;
          }

          let bookingDateTime = null;
          try {
            bookingDateTime = booking.booking_date ? 
              new Date(`${booking.booking_date}T${booking.start_time || '00:00:00'}`) : 
              new Date(booking.created_at);
          } catch (err) {
            console.error('Error parsing date:', err);
            bookingDateTime = new Date();
          }

          console.log('🔍 Extracted data:', { 
            userName, 
            arenaName, 
            invoice: booking.invoice_number,
            amount: booking.final_total_amount || booking.total_amount || 0,
            date: bookingDateTime
          });

          return {
            id: booking.invoice_number || `TXN-${booking.id}`,
            user: userName,
            arena: arenaName,
            amount: parseFloat(booking.final_total_amount) || parseFloat(booking.total_amount) || 0,
            date: bookingDateTime.toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            }),
            time: bookingDateTime.toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            status: booking.payment_status === 'paid' ? 'completed' : 'pending'
          };
        }) || [],
        recentBookings: statsData.recentBookings || [],
        recentUsers: usersData.recent || []
      };

      console.log('📈 Final dashboard data:', dashboardResult);
      setDashboardData(dashboardResult);

    } catch (e) {
      console.error('Error fetching dashboard data:', e);
      console.error('Error stack:', e.stack);
      setError(e.message || 'Terjadi kesalahan saat memuat data');

      // Fallback to mock data on error
      const fallbackData = {
        stats: {
          totalRevenue: 0,
          totalBookings: 0,
          totalUsers: 0,
          totalArenas: 0,
          percentageChange: {
            revenue: 0,
            bookings: 0,
            users: 0,
            arenas: 0
          }
        },
        chartData: generateMockChartData(activeChart),
        topArenas: [],
        recentTransactions: [],
        recentBookings: [],
        recentUsers: []
      };

      setDashboardData(fallbackData);
    }
    setLoading(false);
  };

  const processRealChartData = (apiData, type) => {
    console.log('🔄 Processing real chart data:', { apiData, type });

    if (!apiData) {
      console.log('⚠️ No API data, using mock data');
      return generateMockChartData(type);
    }

    switch (type) {
      case 'revenue':
        if (apiData.revenueData && apiData.revenueData.length > 0) {
          return {
            labels: apiData.revenueData.map(item => item.date),
            datasets: [{
              label: 'Pendapatan (Rp)',
              data: apiData.revenueData.map(item => item.amount),
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4
            }]
          };
        }
        break;
      case 'bookings':
        if (apiData.bookingTrends && apiData.bookingTrends.length > 0) {
          return {
            labels: apiData.bookingTrends.map(item => item.date),
            datasets: [{
              label: 'Jumlah Booking',
              data: apiData.bookingTrends.map(item => item.count),
              backgroundColor: 'rgba(34, 197, 94, 0.8)',
              borderColor: 'rgb(34, 197, 94)',
              borderWidth: 1
            }]
          };
        }
        break;
      case 'users':
        // Use mock data for users as API doesn't provide this yet
        return generateMockChartData(type);
      case 'arenas':
        if (apiData.popularTimes && apiData.popularTimes.length > 0) {
          return {
            labels: apiData.popularTimes.map(item => `${item.hour}:00`),
            datasets: [{
              label: 'Jam Sibuk (Booking)',
              data: apiData.popularTimes.map(item => item.count),
              backgroundColor: [
                'rgba(239, 68, 68, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(34, 197, 94, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(168, 85, 247, 0.8)',
                'rgba(236, 72, 153, 0.8)'
              ],
              borderWidth: 1
            }]
          };
        }
        break;
      default:
        return generateMockChartData(type);
    }

    // Fallback to mock data if no real data available
    console.log('⚠️ No real data available for chart type:', type);
    return generateMockChartData(type);
  };

  const processChartData = (apiData, type) => {
    console.log('🔄 Processing chart data:', { apiData, type });

    if (!apiData || !apiData.chartData) {
      console.log('⚠️ No chart data from API, using mock data');
      return generateMockChartData(type);
    }

    const chartData = apiData.chartData;
    console.log('📊 Chart data from API:', chartData);

    // Check if we have any data
    const hasData = chartData.labels && chartData.labels.length > 0;
    if (!hasData) {
      console.log('⚠️ Empty chart data from API, using mock data');
      return generateMockChartData(type);
    }

    switch (type) {
      case 'revenue':
        return {
          labels: chartData.labels || [],
          datasets: [{
            label: 'Pendapatan (Rp)',
            data: chartData.revenue || [],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4
          }]
        };
      case 'bookings':
        return {
          labels: chartData.labels || [],
          datasets: [{
            label: 'Jumlah Booking',
            data: chartData.bookings || [],
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgb(34, 197, 94)',
            borderWidth: 1
          }]
        };
      case 'users':
        return {
          labels: chartData.labels || [],
          datasets: [{
            label: 'Pengguna Baru',
            data: chartData.users || [],
            borderColor: 'rgb(168, 85, 247)',
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            tension: 0.4
          }]
        };
      case 'arenas':
        return {
          labels: chartData.arenaLabels || [],
          datasets: [{
            label: 'Tingkat Okupansi (%)',
            data: chartData.arenaOccupancy || [],
            backgroundColor: [
              'rgba(239, 68, 68, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(34, 197, 94, 0.8)',
              'rgba(59, 130, 246, 0.8)',
              'rgba(168, 85, 247, 0.8)'
            ],
            borderWidth: 1
          }]
        };
      default:
        return generateMockChartData(type);
    }
  };

  const generateMockChartData = (type) => {
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    switch (type) {
      case 'revenue':
        return {
          labels,
          datasets: [{
            label: 'Pendapatan (Rp)',
            data: [1200000, 1350000, 1100000, 1450000, 1600000, 1750000, 1400000, 1550000, 1650000, 1800000, 1700000, 1900000],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4
          }]
        };
      case 'bookings':
        return {
          labels,
          datasets: [{
            label: 'Jumlah Booking',
            data: [25, 30, 22, 35, 40, 45, 32, 38, 42, 48, 44, 52],
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgb(34, 197, 94)',
            borderWidth: 1
          }]
        };
      case 'users':
        return {
          labels,
          datasets: [{
            label: 'Pengguna Baru',
            data: [8, 12, 6, 15, 18, 22, 14, 16, 20, 25, 21, 28],
            borderColor: 'rgb(168, 85, 247)',
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            tension: 0.4
          }]
        };
      case 'arenas':
        return {
          labels: ['Arena Central', 'SportCenter Elite', 'Arena Futsal Pro', 'Badminton Club', 'Arena Terpadu'],
          datasets: [{
            label: 'Tingkat Okupansi (%)',
            data: [85, 72, 68, 91, 76],
            backgroundColor: [
              'rgba(239, 68, 68, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(34, 197, 94, 0.8)',
              'rgba(59, 130, 246, 0.8)',
              'rgba(168, 85, 247, 0.8)'
            ],
            borderWidth: 1
          }]
        };
      default:
        return { labels: [], datasets: [] };
    }
  };

  const exportReport = (format) => {
    // Simulate export functionality
    success(`Laporan berhasil diekspor dalam format ${format.toUpperCase()}`);
  };

  const printReport = () => {
    window.print();
  };

  const getChangeType = (change) => {
    if (change > 0) return 'increase';
    if (change < 0) return 'decrease';
    return 'neutral';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount || 0);
  };

  // Calculate period statistics from actual dashboard data
  const calculatePeriodStats = () => {
    const stats = dashboardData.stats;

    // Calculate days in current period
    const startDate = new Date(customDateRange.startDate);
    const endDate = new Date(customDateRange.endDate);
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    // Calculate averages based on actual data
    const avgBookingsPerDay = daysDiff > 0 ? Math.round(stats.totalBookings / daysDiff) : 0;
    const avgRevenuePerBooking = stats.totalBookings > 0 ? Math.round(stats.totalRevenue / stats.totalBookings) : 0;
    const conversionRate = stats.totalUsers > 0 ? Math.round((stats.totalBookings / stats.totalUsers) * 100) : 0;

    return {
      totalBookings: stats.totalBookings,
      totalRevenue: stats.totalRevenue,
      avgBookingsPerDay,
      avgRevenuePerBooking,
      conversionRate,
      periodDays: daysDiff
    };
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sporta-blue"></div>
          <span className="ml-3 text-gray-600">Memuat data dashboard...</span>
        </div>
      </AdminLayout>
    );
  }

  // Tampilkan pesan error jika ada
  if (error) {
    return (
      <AdminLayout>
        <div className="p-6 max-w-full overflow-x-hidden">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-2">Error Memuat Data</h3>
            <p>{error}</p>
            <button 
              onClick={fetchDashboardData} 
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-2 sm:p-3 md:p-4 lg:p-6 pb-6 sm:pb-8 md:pb-6 space-y-2 sm:space-y-3 md:space-y-3 max-w-full overflow-x-hidden">
        {/* Header Section */}
        <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:items-start sm:space-y-0">
          <div className="flex-1">
            <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900">Dashboard Admin</h1>
            <p className="text-xs md:text-sm text-gray-600 mt-1">
              Analisis performa bisnis dan laporan keuangan
            </p>
          </div>

          <div className="flex flex-row gap-1 sm:gap-2 flex-shrink-0">
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="flex items-center justify-center gap-1 bg-sporta-blue text-white px-2 py-1 md:px-3 md:py-2 rounded-md hover:bg-blue-600 transition-colors text-xs md:text-sm disabled:opacity-50"
            >
              {loading ? <FaSpinner className="animate-spin" size={8} /> : <FaSync size={8} />}
              <span className="hidden sm:inline text-xs md:text-sm">Refresh</span>
            </button>
            <button
              onClick={printReport}
              className="flex items-center justify-center gap-1 bg-gray-600 text-white px-2 py-1 md:px-3 md:py-2 rounded-md hover:bg-gray-700 transition-colors text-xs md:text-sm"
            >
              <FaPrint size={8} />
              <span className="hidden sm:inline text-xs md:text-sm">Print</span>
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white p-2 sm:p-3 md:p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="space-y-2">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 sm:gap-3">
              {/* Period Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Periode
                </label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-2 py-1 md:px-3 md:py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs md:text-sm"
                >
                  {periodOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Custom Date Range */}
              {period === 'custom' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tanggal Mulai
                    </label>
                    <input
                      type="date"
                      value={customDateRange.startDate}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-2 py-1 md:px-3 md:py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs md:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tanggal Akhir
                    </label>
                    <input
                      type="date"
                      value={customDateRange.endDate}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-2 py-1 md:px-3 md:py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs md:text-sm"
                    />
                  </div>
                </>
              )}

              {/* Export Options */}
              <div className="flex gap-1 col-span-1 sm:col-span-2 lg:col-span-1">
                <button
                  onClick={() => exportReport('pdf')}
                  className="flex-1 flex items-center justify-center gap-1 bg-red-600 text-white px-2 py-1 md:px-3 md:py-2 rounded-md hover:bg-red-700 transition-colors text-xs md:text-sm"
                >
                  <FaDownload size={8} />
                  PDF
                </button>
                <button
                  onClick={() => exportReport('excel')}
                  className="flex-1 flex items-center justify-center gap-1 bg-green-600 text-white px-2 py-1 md:px-3 md:py-2 rounded-md hover:bg-green-700 transition-colors text-xs md:text-sm"
                >
                  <FaDownload size={8} />
                  Excel
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <StatCard
            title="Total Pendapatan"
            value={dashboardData.stats.totalRevenue}
            change={dashboardData.stats.percentageChange.revenue}
            changeType={getChangeType(dashboardData.stats.percentageChange.revenue)}
            icon={FaMoneyBillWave}
            color="text-green-500"
            prefix="Rp "
          />
          <StatCard
            title="Total Booking"
            value={dashboardData.stats.totalBookings}
            change={dashboardData.stats.percentageChange.bookings}
            changeType={getChangeType(dashboardData.stats.percentageChange.bookings)}
            icon={FaCalendarAlt}
            color="text-blue-500"
          />
          <StatCard
            title="Total Pengguna"
            value={dashboardData.stats.totalUsers}
            change={dashboardData.stats.percentageChange.users}
            changeType={getChangeType(dashboardData.stats.percentageChange.users)}
            icon={FaUsers}
            color="text-purple-500"
          />
          <StatCard
            title="Total Arena"
            value={dashboardData.stats.totalArenas}
            change={dashboardData.stats.percentageChange.arenas}
            changeType={getChangeType(dashboardData.stats.percentageChange.arenas)}
            icon={FaBuilding}
            color="text-orange-500"
          />
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-2 sm:p-3 md:p-4 border-b border-gray-200">
            <div className="flex flex-col gap-2">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Analisis Grafik</h3>

              {/* Chart Type Selector */}
              <div className="flex flex-wrap gap-1 md:gap-2">
                {chartTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => setActiveChart(type.value)}
                      className={`flex items-center gap-1 px-2 py-1 md:px-3 md:py-2 rounded-md text-xs md:text-sm transition-colors ${
                        activeChart === type.value
                          ? 'bg-sporta-blue text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Icon size={window.innerWidth < 768 ? 8 : 12} />
                      <span className="hidden sm:inline">{type.label}</span>
                      <span className="sm:hidden">{type.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-2 sm:p-3 md:p-4">
            <div className="h-40 sm:h-48 md:h-64 lg:h-80 w-full overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <FaSpinner className="animate-spin mr-2 text-blue-500" />
                  <span className="text-gray-500">Memuat grafik...</span>
                </div>
              ) : (
                <div className="h-full w-full">
                  {activeChart === 'revenue' && <Line data={dashboardData.chartData} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                      intersect: false,
                      mode: 'index'
                    },
                    scales: {
                      x: {
                        display: true,
                        grid: {
                          display: false
                        },
                        ticks: {
                          maxTicksLimit: window.innerWidth < 768 ? 6 : 12,
                          font: {
                            size: window.innerWidth < 768 ? 10 : 12
                          }
                        }
                      },
                      y: {
                        display: true,
                        ticks: {
                          font: {
                            size: window.innerWidth < 768 ? 10 : 12
                          }
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: {
                          font: {
                            size: window.innerWidth < 768 ? 10 : 12
                          }
                        }
                      },
                      title: {
                        display: true,
                        text: 'Tren Pendapatan',
                        font: {
                          size: window.innerWidth < 768 ? 12 : 14
                        }
                      }
                    }
                  }} />}
                  {activeChart === 'bookings' && <Bar data={dashboardData.chartData} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                      intersect: false,
                      mode: 'index'
                    },
                    scales: {
                      x: {
                        display: true,
                        grid: {
                          display: false
                        },
                        ticks: {
                          maxTicksLimit: window.innerWidth < 768 ? 6 : 12,
                          font: {
                            size: window.innerWidth < 768 ? 10 : 12
                          }
                        }
                      },
                      y: {
                        display: true,
                        ticks: {
                          font: {
                            size: window.innerWidth < 768 ? 10 : 12
                          }
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: {
                          font: {
                            size: window.innerWidth < 768 ? 10 : 12
                          }
                        }
                      },
                      title: {
                        display: true,
                        text: 'Jumlah Booking per Bulan',
                        font: {
                          size: window.innerWidth < 768 ? 12 : 14
                        }
                      }
                    }
                  }} />}
                  {activeChart === 'users' && <Line data={dashboardData.chartData} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                      intersect: false,
                      mode: 'index'
                    },
                    scales: {
                      x: {
                        display: true,
                        grid: {
                          display: false
                        },
                        ticks: {
                          maxTicksLimit: window.innerWidth < 768 ? 6 : 12,
                          font: {
                            size: window.innerWidth < 768 ? 10 : 12
                          }
                        }
                      },
                      y: {
                        display: true,
                        ticks: {
                          font: {
                            size: window.innerWidth < 768 ? 10 : 12
                          }
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: {
                          font: {
                            size: window.innerWidth < 768 ? 10 : 12
                          }
                        }
                      },
                      title: {
                        display: true,
                        text: 'Pertumbuhan Pengguna',
                        font: {
                          size: window.innerWidth < 768 ? 12 : 14
                        }
                      }
                    }
                  }} />}
                  {activeChart === 'arenas' && <Doughnut data={dashboardData.chartData} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: window.innerWidth < 768 ? 'bottom' : 'right',
                        labels: {
                          font: {
                            size: window.innerWidth < 768 ? 10 : 12
                          },
                          padding: window.innerWidth < 768 ? 10 : 20
                        }
                      },
                      title: {
                        display: true,
                        text: 'Tingkat Okupansi Arena',
                        font: {
                          size: window.innerWidth < 768 ? 12 : 14
                        }
                      }
                    }
                  }} />}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-2 sm:p-3 md:p-4 border-b border-gray-200">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Ringkasan Periode</h3>
            <p className="text-xs md:text-sm text-gray-600">Performa bisnis dalam periode yang dipilih</p>
          </div>
          <div className="p-2 sm:p-3 md:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4">
              {(() => {
                const periodStats = calculatePeriodStats();
                return (
                  <>
                    <div className="text-center p-2 sm:p-3 md:p-4 bg-blue-50 rounded-lg">
                      <div className="text-base sm:text-lg md:text-xl font-bold text-blue-600">
                        {formatCurrency(periodStats.avgRevenuePerBooking)}
                      </div>
                      <div className="text-xs md:text-sm text-blue-800">Rata-rata per Booking</div>
                      <div className="text-xs text-gray-600">dalam periode {periodStats.periodDays} hari</div>
                    </div>
                    <div className="text-center p-2 sm:p-3 md:p-4 bg-green-50 rounded-lg">
                      <div className="text-base sm:text-lg md:text-xl font-bold text-green-600">
                        {periodStats.avgBookingsPerDay}
                      </div>
                      <div className="text-xs md:text-sm text-green-800">Booking per Hari</div>
                      <div className="text-xs text-gray-600">rata-rata harian</div>
                    </div>
                    <div className="text-center p-2 sm:p-3 md:p-4 bg-purple-50 rounded-lg">
                      <div className="text-base sm:text-lg md:text-xl font-bold text-purple-600">
                        {periodStats.conversionRate}%
                      </div>
                      <div className="text-xs md:text-sm text-purple-800">Tingkat Konversi</div>
                      <div className="text-xs text-gray-600">user ke booking</div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="space-y-2 sm:space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
          {/* Top Performing Arenas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-2 sm:p-3 md:p-4 border-b border-gray-200">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Arena Terbaik</h3>
              <p className="text-xs md:text-sm text-gray-600">Berdasarkan pendapatan dan jumlah booking</p>
            </div>
            <div className="p-2 sm:p-3 md:p-4 pb-4 sm:pb-6">
              <div className="space-y-2 md:space-y-3">
                {dashboardData.topArenas.length > 0 ? (
                  dashboardData.topArenas.map((arena, index) => (
                    <div key={index} className="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs md:text-sm font-medium text-gray-900 truncate">{arena.name}</p>
                          <p className="text-xs text-gray-600">{arena.bookings} booking</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-xs md:text-sm font-bold text-gray-900">{formatCurrency(arena.revenue)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FaBuilding className="mx-auto mb-2 text-gray-300" size={20} />
                    <p className="text-xs md:text-sm">Belum ada data arena</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-2 sm:p-3 md:p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Transaksi Terbaru</h3>
                  <p className="text-xs md:text-sm text-gray-600">Aktivitas pembayaran terkini</p>
                </div>
                <button
                  onClick={() => navigate('/admin/bookings')}
                  className="text-xs md:text-sm text-sporta-blue hover:text-blue-700"
                >
                  Lihat Semua
                </button>
              </div>
            </div>
            <div className="p-2 sm:p-3 md:p-4 pb-4 sm:pb-6">
              <div className="space-y-2 md:space-y-3">
                {dashboardData.recentTransactions.length > 0 ? (
                  dashboardData.recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-2 md:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm font-medium text-gray-900 truncate">{transaction.user}</p>
                        <p className="text-xs text-gray-600 truncate">{transaction.arena}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-500">{transaction.date}</p>
                          {transaction.time && (
                            <span className="text-xs text-gray-400 hidden sm:inline">• {transaction.time}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-2 md:ml-3 flex-shrink-0">
                        <p className="text-xs md:text-sm font-bold text-gray-900">{formatCurrency(transaction.amount)}</p>
                        <span className={`inline-block px-1 md:px-2 py-1 text-xs rounded-full ${
                          transaction.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {transaction.status === 'completed' ? 'Selesai' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FaCalendarAlt className="mx-auto mb-2 text-gray-300" size={20} />
                    <p className="text-xs md:text-sm">Belum ada transaksi dalam periode ini</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;