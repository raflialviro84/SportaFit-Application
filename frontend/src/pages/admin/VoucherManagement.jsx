import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoAdd,
  IoSearch,
  IoFilter,
  IoEye,
  IoCreate,
  IoTrash,
  IoTicketOutline,
  IoCalendarOutline,
  IoPeopleOutline,
  IoStatsChartOutline
} from 'react-icons/io5';
import AdminLayout from '../../components/AdminLayout';

export default function VoucherManagement() {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    totalVouchers: 0,
    activeVouchers: 0,
    inactiveVouchers: 0,
    totalUsage: 0
  });

  // Fetch voucher statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/vouchers/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data.overview);
      }
    } catch (error) {
      console.error('Error fetching voucher stats:', error);
    }
  };

  // Fetch vouchers
  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter
      });

      const response = await fetch(`/api/vouchers/admin/all?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVouchers(data.data.vouchers);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        setError('Gagal memuat data voucher');
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      setError('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchVouchers();
  }, [currentPage, searchTerm, statusFilter]);

  // Handle delete voucher
  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus voucher ini?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/vouchers/admin/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchVouchers();
        fetchStats();
      } else {
        alert('Gagal menghapus voucher');
      }
    } catch (error) {
      console.error('Error deleting voucher:', error);
      alert('Terjadi kesalahan saat menghapus voucher');
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading && vouchers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data voucher...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="bg-white shadow-sm border-b rounded-lg mb-4 md:mb-6">
        <div className="px-4 py-4 md:px-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Manajemen Voucher</h1>
              <p className="mt-1 text-sm text-gray-500">
                Kelola voucher dan promosi untuk pengguna
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/vouchers/add')}
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full md:w-auto"
            >
              <IoAdd className="mr-2" size={20} />
              Tambah Voucher
            </button>
          </div>
        </div>
      </div>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-8">
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <IoTicketOutline className="text-blue-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Voucher</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.totalVouchers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <IoStatsChartOutline className="text-green-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Voucher Aktif</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.activeVouchers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <IoCalendarOutline className="text-red-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tidak Aktif</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.inactiveVouchers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <IoPeopleOutline className="text-purple-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Penggunaan</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.totalUsage}</p>
              </div>
            </div>
          </div>
        </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-4 md:mb-6">
        <div className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <div className="flex-1">
              <div className="relative">
                <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Cari voucher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Vouchers Table - Desktop */}
      <div className="bg-white rounded-lg shadow overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Voucher
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Diskon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Periode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Penggunaan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vouchers.map((voucher) => (
                <tr key={voucher.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src={voucher.imageUrl || '/api/placeholder/48/48'}
                          alt={voucher.title}
                          onError={(e) => {
                            e.target.src = '/api/placeholder/48/48';
                          }}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {voucher.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {voucher.code}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {voucher.discountType === 'percentage'
                        ? `${voucher.discountValue}%`
                        : formatCurrency(voucher.discountValue)
                      }
                    </div>
                    {voucher.maxDiscount && (
                      <div className="text-xs text-gray-500">
                        Maks: {formatCurrency(voucher.maxDiscount)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{formatDate(voucher.startDate)}</div>
                    <div>s/d {formatDate(voucher.endDate)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{voucher.usedCount} / {voucher.totalUsers} pengguna</div>
                    {voucher.usageLimit && (
                      <div className="text-xs">
                        Limit: {voucher.usageLimit}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      voucher.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {voucher.isActive ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/admin/vouchers/${voucher.id}/users`)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Lihat Pengguna"
                      >
                        <IoEye size={18} />
                      </button>
                      <button
                        onClick={() => navigate(`/admin/vouchers/edit/${voucher.id}`)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Edit"
                      >
                        <IoCreate size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(voucher.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Hapus"
                      >
                        <IoTrash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vouchers Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {vouchers.map((voucher) => (
          <div key={voucher.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4">
              <div className="flex items-center mb-3">
                <div className="flex-shrink-0 h-12 w-12">
                  <img
                    className="h-12 w-12 rounded-lg object-cover"
                    src={voucher.imageUrl || '/api/placeholder/48/48'}
                    alt={voucher.title}
                    onError={(e) => {
                      e.target.src = '/api/placeholder/48/48';
                    }}
                  />
                </div>
                <div className="ml-4 flex-1">
                  <div className="text-sm font-medium text-gray-900">{voucher.title}</div>
                  <div className="text-xs text-gray-500">{voucher.code}</div>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  voucher.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {voucher.isActive ? 'Aktif' : 'Tidak Aktif'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
                <div>
                  <span className="font-medium">Diskon:</span> 
                  <div className="mt-1">
                    {voucher.discountType === 'percentage'
                      ? `${voucher.discountValue}%`
                      : formatCurrency(voucher.discountValue)
                    }
                    {voucher.maxDiscount && (
                      <span className="block">
                        Maks: {formatCurrency(voucher.maxDiscount)}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Periode:</span>
                  <div className="mt-1">
                    {formatDate(voucher.startDate)}
                    <span className="block">s/d {formatDate(voucher.endDate)}</span>
                  </div>
                </div>
                <div>
                  <span className="font-medium">Penggunaan:</span>
                  <div className="mt-1">
                    {voucher.usedCount} / {voucher.totalUsers} pengguna
                    {voucher.usageLimit && (
                      <span className="block">
                        Limit: {voucher.usageLimit}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <button
                  onClick={() => navigate(`/admin/vouchers/${voucher.id}/users`)}
                  className="flex items-center text-blue-600"
                >
                  <IoEye size={16} className="mr-1" />
                  <span className="text-xs">Pengguna</span>
                </button>
                <button
                  onClick={() => navigate(`/admin/vouchers/edit/${voucher.id}`)}
                  className="flex items-center text-yellow-600"
                >
                  <IoCreate size={16} className="mr-1" />
                  <span className="text-xs">Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(voucher.id)}
                  className="flex items-center text-red-600"
                >
                  <IoTrash size={16} className="mr-1" />
                  <span className="text-xs">Hapus</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 rounded-lg shadow mt-4">
          <div className="flex-1 flex justify-between">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <div className="hidden sm:flex items-center">
              <p className="text-sm text-gray-700">
                Halaman <span className="font-medium">{currentPage}</span> dari{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && vouchers.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6 md:p-12 text-center">
          <IoTicketOutline className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada voucher</h3>
          <p className="mt-1 text-sm text-gray-500">
            Mulai dengan membuat voucher pertama Anda.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/admin/vouchers/add')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <IoAdd className="mr-2" size={20} />
              Tambah Voucher
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}
    </AdminLayout>
  );
}
