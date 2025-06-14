import React, { useEffect, useState } from 'react';
import BookingService from '../../services/bookingService';
import AdminLayout from '../../components/AdminLayout';
import { useNotification } from '../../context/NotificationContext';
import BookingDetailModal from '../../components/BookingDetailModal';
import {
  FaEye,
  FaEdit,
  FaTimes,
  FaSpinner,
  FaSync,
  FaDownload,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaChartBar,
  FaChartLine,
  FaMoneyBillWave,
  FaChevronDown,
  FaChevronUp,
  FaClock,
  FaMapMarkerAlt,
  FaUser
} from 'react-icons/fa';

const statusOptions = [
  { value: '', label: 'Semua' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'expired', label: 'Expired' },
];

// StatBox Component - Updated to match ArenaManagement design
const StatBox = ({ label, value, prefix = '', icon: IconComponent, iconColor = 'text-blue-500' }) => (
  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-600 truncate">{label}</p>
        <p className="text-sm md:text-lg font-bold text-gray-900 truncate">
          {prefix}{typeof value === 'number' ? value.toLocaleString('id-ID') : value}
        </p>
      </div>
      {IconComponent && (
        <div className={`p-2 rounded-full bg-gray-100 ${iconColor} flex-shrink-0 ml-2`}>
          <IconComponent size={14} />
        </div>
      )}
    </div>
  </div>
);

// StatusBadge Component
const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Menunggu';
      case 'confirmed': return 'Terkonfirmasi';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      case 'expired': return 'Kadaluarsa';
      default: return status;
    }
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
      {getStatusText(status)}
    </span>
  );
};

// PaymentStatusBadge Component
const PaymentStatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'unpaid': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'refunded': return 'bg-purple-100 text-purple-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'unpaid': return 'Belum Bayar';
      case 'paid': return 'Sudah Bayar';
      case 'refunded': return 'Refund';
      case 'failed': return 'Gagal';
      default: return status;
    }
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
      {getStatusText(status)}
    </span>
  );
};

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState({ today: 0, week: 0, month: 0, revenue: 0 });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { success, error: notificationError } = useNotification();

  useEffect(() => {
    fetchBookings();
  }, [page, search, status, dateFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await BookingService.getAllBookings(page, limit, search, status, dateFilter);
      if (res.success) {
        setBookings(res.data || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 0);
        setStats({
          today: res.stats?.today || 0,
          week: res.stats?.week || 0,
          month: res.stats?.month || 0,
          revenue: res.stats?.revenue || 0,
        });
      } else {
        const errorMsg = 'Gagal memuat data booking';
        setError(errorMsg);
        notificationError(errorMsg);
      }
    } catch (e) {
      console.error('Error fetching bookings:', e);
      const errorMsg = 'Gagal memuat data booking: ' + e.message;
      setError(errorMsg);
      notificationError(errorMsg);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatus = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  const handleDateFilter = (e) => {
    setDateFilter(e.target.value);
    setPage(1);
  };

  const exportToCSV = () => {
    const csvData = bookings.map(booking => ({
      'Invoice': booking.invoice_number,
      'User': booking.user?.name || '-',
      'Arena': booking.court?.arena?.name || '-',
      'Tanggal': formatDate(booking.booking_date),
      'Waktu': `${formatTime(booking.start_time)} - ${formatTime(booking.end_time)}`,
      'Status': booking.status,
      'Status Pembayaran': booking.payment_status,
      'Total': booking.final_total_amount
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleViewDetail = async (booking) => {
    try {
      const res = await BookingService.getBookingDetail(booking.invoice_number);
      if (res.success) {
        setSelectedBooking(res.data);
        setShowDetailModal(true);
      } else {
        notificationError('Gagal memuat detail booking');
      }
    } catch (e) {
      console.error('Error fetching booking detail:', e);
      notificationError('Gagal memuat detail booking: ' + e.message);
    }
  };

  const handleUpdateStatus = async (newStatus, paymentStatus = null) => {
    if (!selectedBooking) return;

    // Konfirmasi perubahan status
    const statusText = statusOptions.find(opt => opt.value === newStatus)?.label || newStatus;
    const confirmMessage = `Apakah Anda yakin ingin mengubah status booking ${selectedBooking.invoice_number} menjadi "${statusText}"?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setUpdatingStatus(true);
    try {
      const res = await BookingService.updateBookingStatus(
        selectedBooking.invoice_number,
        newStatus,
        paymentStatus
      );
      if (res.success) {
        success(`Status booking berhasil diubah menjadi "${statusText}"`);
        setShowStatusModal(false);
        setShowDetailModal(false);
        fetchBookings(); // Refresh data
      } else {
        notificationError('Gagal memperbarui status booking');
      }
    } catch (e) {
      console.error('Error updating booking status:', e);
      notificationError('Gagal memperbarui status booking: ' + e.message);
    }
    setUpdatingStatus(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const formatTime = (timeString) => {
    return timeString ? timeString.substring(0, 5) : '';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount || 0);
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    return new Date(dateTimeString).toLocaleString('id-ID');
  };

  const isExpiringSoon = (booking) => {
    if (booking.status !== 'pending' || !booking.expiry_time) return false;
    const expiryTime = new Date(booking.expiry_time);
    const now = new Date();
    const timeDiff = expiryTime - now;
    return timeDiff > 0 && timeDiff < 30 * 60 * 1000; // 30 minutes
  };

  const resetFilters = () => {
    setSearch('');
    setStatus('');
    setDateFilter('');
    setPage(1);
  };

  return (
    <AdminLayout>
      <div className="p-3 md:p-6 space-y-3 md:space-y-4 max-w-full">
        {/* Header Section */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-gray-900">Manajemen Booking</h1>
            <p className="text-xs md:text-sm text-gray-600 mt-1">
              Kelola data booking dan reservasi lapangan
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchBookings}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-sporta-blue text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm disabled:opacity-50 flex-1 sm:flex-none"
            >
              {loading ? <FaSpinner className="animate-spin" size={12} /> : <FaSync size={12} />}
              <span className="sm:inline">Refresh</span>
            </button>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm flex-1 sm:flex-none"
            >
              <FaFilter size={12} />
              <span className="sm:inline">Filter</span>
              {showFilters ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
            </button>
          </div>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatBox
            label="Booking Hari Ini"
            value={stats.today}
            icon={FaCalendarAlt}
            iconColor="text-blue-500"
          />
          <StatBox
            label="Booking Minggu Ini"
            value={stats.week}
            icon={FaChartBar}
            iconColor="text-green-500"
          />
          <StatBox
            label="Booking Bulan Ini"
            value={stats.month}
            icon={FaChartLine}
            iconColor="text-purple-500"
          />
          <StatBox
            label="Total Pendapatan"
            value={stats.revenue}
            prefix="Rp "
            icon={FaMoneyBillWave}
            iconColor="text-yellow-500"
          />
        </div>
        
        {/* Search and Filter Section - Collapsible on mobile */}
        <div className={`transition-all duration-300 overflow-hidden ${showFilters ? 'max-h-96' : 'max-h-0 sm:max-h-96'}`}>
          <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="space-y-3">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
                <input
                  type="text"
                  placeholder="Cari user, arena, atau invoice..."
                  value={search}
                  onChange={handleSearch}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Filters Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Status Filter */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Status Booking</label>
                  <select
                    value={status}
                    onChange={handleStatus}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Date Filter */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Tanggal Booking</label>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={handleDateFilter}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Export Button */}
                <div className="flex flex-col justify-end">
                  <div className="flex gap-2">
                    <button
                      onClick={resetFilters}
                      disabled={!search && !status && !dateFilter}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaTimes size={10} />
                      Reset
                    </button>
                    
                    <button
                      onClick={exportToCSV}
                      disabled={bookings.length === 0}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaDownload size={10} />
                      Export
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Error State */}
        {error && !loading && (
          <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6 text-center">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Gagal memuat data</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={fetchBookings}
              className="bg-sporta-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Results Info */}
        {!error && (
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs md:text-sm text-gray-600 px-1">
            <span>
              {loading ? 'Memuat...' :
                `Menampilkan ${bookings.length} dari ${total} booking
                ${search ? ` (pencarian: "${search}")` : ''}
                ${status ? ` (status: ${statusOptions.find(opt => opt.value === status)?.label})` : ''}
                ${dateFilter ? ` (tanggal: ${formatDate(dateFilter)})` : ''}`
              }
            </span>
            <span className="text-right">
              Halaman {page} dari {totalPages || 1}
            </span>
          </div>
        )}

        {/* Booking List - Desktop Table */}
        {!error && (
          <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Arena
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jam
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pembayaran
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-8 text-center">
                        <div className="flex items-center justify-center">
                          <FaSpinner className="animate-spin mr-2 text-blue-500" />
                          <span className="text-gray-500">Memuat data booking...</span>
                        </div>
                      </td>
                    </tr>
                  ) : bookings.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-8 text-center">
                        <div className="text-gray-500">
                          <div className="text-4xl mb-2">📋</div>
                          <div className="font-medium">Tidak ada data booking</div>
                          <div className="text-sm mt-1">Coba ubah filter pencarian</div>
                        </div>
                      </td>
                    </tr>
                  ) : bookings.map(b => (
                    <tr key={b.id} className={`hover:bg-gray-50 ${isExpiringSoon(b) ? 'bg-yellow-50' : ''}`}>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-900">{b.invoice_number || b.id}</span>
                          {isExpiringSoon(b) && (
                            <span className="text-xs text-orange-600">⚠️ Akan kadaluarsa</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaUser className="text-gray-400 mr-1" size={10} />
                          <div>
                            <div className="text-xs font-medium text-gray-900">{b.user?.name || '-'}</div>
                            <div className="text-xs text-gray-500">{b.user?.email || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaMapMarkerAlt className="text-gray-400 mr-1" size={10} />
                          <div>
                            <div className="text-xs font-medium text-gray-900">{b.court?.arena?.name || '-'}</div>
                            <div className="text-xs text-gray-500">{b.court?.name || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="text-xs text-gray-900">{formatDate(b.booking_date)}</div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaClock className="text-gray-400 mr-1" size={8} />
                          <span className="text-xs text-gray-900">{formatTime(b.start_time)} - {formatTime(b.end_time)}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <StatusBadge status={b.status} />
                          {b.expiry_time && b.status === 'pending' && (
                            <span className="text-xs text-gray-500">
                              Exp: {formatDateTime(b.expiry_time)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <PaymentStatusBadge status={b.payment_status} />
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-900">{formatCurrency(b.final_total_amount)}</span>
                          {b.discount_amount > 0 && (
                            <span className="text-xs text-green-600">
                              Diskon: {formatCurrency(b.discount_amount)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-right text-xs font-medium">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => handleViewDetail(b)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Lihat Detail"
                          >
                            <FaEye size={12} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBooking(b);
                              setShowStatusModal(true);
                            }}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Ubah Status"
                          >
                            <FaEdit size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Booking List - Mobile Cards */}
        {!error && (
          <div className="lg:hidden space-y-3">
            {loading ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <div className="flex items-center justify-center">
                  <FaSpinner className="animate-spin mr-2 text-blue-500" />
                  <span className="text-gray-500">Memuat data booking...</span>
                </div>
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <div className="text-gray-500">
                  <div className="text-4xl mb-2">📋</div>
                  <div className="font-medium">Tidak ada data booking</div>
                  <div className="text-sm mt-1">Coba ubah filter pencarian</div>
                </div>
              </div>
            ) : bookings.map(b => (
            <div key={b.id} className={`bg-white rounded-lg shadow-sm border border-gray-200 p-3 ${isExpiringSoon(b) ? 'border-yellow-300 bg-yellow-50' : ''}`}>
              <div className="space-y-2">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{b.invoice_number || b.id}</h3>
                    {isExpiringSoon(b) && (
                      <span className="text-xs text-orange-600">⚠️ Akan kadaluarsa</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <StatusBadge status={b.status} />
                    <PaymentStatusBadge status={b.payment_status} />
                  </div>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FaUser size={10} className="flex-shrink-0" />
                  <span className="truncate">{b.user?.name || '-'}</span>
                </div>

                {/* Arena Info */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FaMapMarkerAlt size={10} className="flex-shrink-0" />
                  <span className="truncate">{b.court?.arena?.name || '-'} - {b.court?.name || '-'}</span>
                </div>

                {/* Date & Time */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FaClock size={10} className="flex-shrink-0" />
                  <span>{formatDate(b.booking_date)} • {formatTime(b.start_time)} - {formatTime(b.end_time)}</span>
                </div>

                {/* Price & Actions */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(b.final_total_amount)}</div>
                    {b.discount_amount > 0 && (
                      <div className="text-xs text-green-600">Diskon: {formatCurrency(b.discount_amount)}</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDetail(b)}
                      className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"
                      title="Lihat Detail"
                    >
                      <FaEye size={14} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBooking(b);
                        setShowStatusModal(true);
                      }}
                      className="p-1.5 bg-green-100 text-green-600 rounded-lg"
                      title="Ubah Status"
                    >
                      <FaEdit size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        {/* Pagination */}
        {!error && totalPages > 1 && (
          <div className="flex justify-center items-center gap-1 mt-4">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-2 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-xs"
            >
              Prev
            </button>

            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-2 py-1 border rounded-lg text-xs ${
                    page === pageNum
                      ? 'bg-sporta-blue text-white border-sporta-blue'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-2 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-xs"
            >
              Next
            </button>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedBooking && (
          <BookingDetailModal 
            isOpen={showDetailModal}
            onClose={() => setShowDetailModal(false)}
            booking={selectedBooking}
          />
        )}

        {/* Status Update Modal */}
        {showStatusModal && selectedBooking && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Ubah Status Booking</h2>
                <button
                  className="text-gray-500 hover:text-gray-700 p-1"
                  onClick={() => setShowStatusModal(false)}
                >
                  <FaTimes size={16} />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Invoice: <span className="font-medium">{selectedBooking.invoice_number}</span>
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Status Booking</label>
                  <div className="space-y-2">
                    {statusOptions.filter(opt => opt.value !== '').map(option => (
                      <button
                        key={option.value}
                        className={`w-full flex items-center justify-between px-4 py-2 rounded-lg border ${
                          selectedBooking.status === option.value
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'border-gray-300 hover:bg-gray-50 text-gray-800'
                        }`}
                        onClick={() => handleUpdateStatus(option.value)}
                        disabled={updatingStatus || selectedBooking.status === option.value}
                      >
                        <span className="flex items-center">
                          {selectedBooking.status === option.value ? (
                            <span className="w-4 h-4 mr-2 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </span>
                          ) : (
                            <span className="w-4 h-4 mr-2 rounded-full border border-gray-400"></span>
                          )}
                          {option.label}
                        </span>
                        {selectedBooking.status === option.value && (
                          <span className="text-xs bg-blue-100 px-2 py-1 rounded">Saat ini</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedBooking.status === 'confirmed' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Status Pembayaran</label>
                    <div className="space-y-2">
                      <button
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                        onClick={() => handleUpdateStatus('confirmed', 'paid')}
                        disabled={updatingStatus || selectedBooking.payment_status === 'paid'}
                      >
                        {updatingStatus ? (
                          <FaSpinner className="animate-spin mr-2" size={14} />
                        ) : (
                          <span className="mr-2">💰</span>
                        )}
                        {selectedBooking.payment_status === 'paid' ? 'Sudah Dibayar' : 'Tandai Sudah Dibayar'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
                  <button
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    onClick={() => setShowStatusModal(false)}
                  >
                    Batal
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    disabled={updatingStatus}
                    onClick={() => setShowStatusModal(false)}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default BookingManagement;
