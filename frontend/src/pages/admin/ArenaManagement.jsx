import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaFilter,
  FaBuilding,
  FaStar,
  FaMapMarkerAlt,
  FaClock,
  FaUsers,
  FaChevronDown,
  FaChevronUp,
  FaSpinner
} from 'react-icons/fa';

const statusOptions = ["Semua Status", "active", "maintenance", "inactive"];

function ArenaManagement() {
  const navigate = useNavigate();

  // States
  const [arenas, setArenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Semua Kota');
  const [selectedStatus, setSelectedStatus] = useState('Semua Status');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [cities, setCities] = useState(["Semua Kota"]);

  // Fetch arenas from API
  const fetchArenas = async () => {
    try {
      setLoading(true);
      console.log('Fetching arenas...');

      // Fetch from API
      let response;
      let data = [];

      // Gunakan selalu uas.sekai.id:3000 untuk API URL
      const apiUrl = 'http://uas.sekai.id:3000/api/arenas';
      
      console.log('Using API URL:', apiUrl);

      response = await fetch(apiUrl);
      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      data = await response.json();
      console.log('Fetched arenas:', data.length);

      // Transform data to match expected format
      const transformedData = data.map((arena) => ({
        id: arena.id,
        name: arena.name || 'Unknown Arena',
        address: arena.address || 'No address',
        city: arena.city || 'Unknown City',
        image_url: arena.images && arena.images.length > 0 ? arena.images[0] : '/foto_lapangan.png',
        rating: arena.rating || 0,
        reviews_count: arena.reviews_count || 0,
        opening_hours: arena.opening_hours || '08:00-22:00',
        price_per_hour: arena.price_per_hour || 0,
        status: arena.status || 'active',
        courts_count: 4, // Default courts count
        facilities: Array.isArray(arena.facilities) ? arena.facilities : [],
        created_at: arena.created_at,
        total_bookings: Math.floor(Math.random() * 500) + 200, // Simulated data
        total_revenue: Math.floor(Math.random() * 5000000) + 2000000 // Simulated data
      }));

      console.log('Transformed data:', transformedData.length);

      // Apply client-side filtering and sorting
      let filteredData = transformedData.filter(arena => {
        const matchesSearch = !searchQuery ||
          arena.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          arena.address.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCity = selectedCity === 'Semua Kota' || arena.city === selectedCity;
        const matchesStatus = selectedStatus === 'Semua Status' || arena.status === selectedStatus;

        return matchesSearch && matchesCity && matchesStatus;
      });

      // Apply sorting
      filteredData.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      setArenas(filteredData);

      // Extract unique cities
      const uniqueCities = ["Semua Kota", ...new Set(transformedData.map(arena => arena.city))];
      setCities(uniqueCities);

      console.log('Final filtered data:', filteredData.length);

    } catch (error) {
      console.error('Error in fetchArenas:', error);
      setArenas([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchArenas();
  }, [searchQuery, selectedCity, selectedStatus, sortBy, sortOrder]);

  // Since filtering and sorting is now done on server side, use arenas directly
  const paginatedArenas = arenas.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(arenas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  // Handlers
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus arena ini?')) {
      try {
        // For now, just remove from local state (mock delete)
        setArenas(arenas.filter(arena => arena.id !== id));
        alert('Arena berhasil dihapus!');
      } catch (error) {
        console.error('Error deleting arena:', error);
        alert('Gagal menghapus arena. Silakan coba lagi.');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      console.log(`Updating arena ${id} status to ${newStatus}`);

      // Update local state immediately for better UX
      setArenas(prev => prev.map(arena =>
        arena.id === id ? { ...arena, status: newStatus } : arena
      ));

      // Gunakan selalu uas.sekai.id:3000 untuk API URL
      const apiUrl = `http://uas.sekai.id:3000/api/arenas/${id}`;
      
      console.log('Using API URL for status update:', apiUrl);

      // Make API call to update status
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.status}`);
      }

      console.log('Arena status updated successfully');
    } catch (error) {
      console.error('Error updating arena status:', error);
      alert('Gagal mengubah status arena. Silakan coba lagi.');
      // Revert the change by refetching data
      fetchArenas();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'maintenance': return 'Maintenance';
      case 'inactive': return 'Nonaktif';
      default: return status;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-start md:space-y-0">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Manajemen Arena</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Kelola data arena dan lapangan badminton
            </p>
          </div>
          
          <button
            onClick={() => navigate('/admin/arenas/add')}
            className="flex items-center gap-2 bg-sporta-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm md:text-base"
          >
            <FaPlus size={14} />
            Tambah Arena
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600">Total Arena</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">{arenas.length}</p>
              </div>
              <FaBuilding className="text-blue-500 text-xl md:text-2xl" />
            </div>
          </div>
          
          <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600">Arena Aktif</p>
                <p className="text-lg md:text-2xl font-bold text-green-600">
                  {arenas.filter(a => a.status === 'active').length}
                </p>
              </div>
              <FaUsers className="text-green-500 text-xl md:text-2xl" />
            </div>
          </div>
          
          <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600">Maintenance</p>
                <p className="text-lg md:text-2xl font-bold text-yellow-600">
                  {arenas.filter(a => a.status === 'maintenance').length}
                </p>
              </div>
              <FaClock className="text-yellow-500 text-xl md:text-2xl" />
            </div>
          </div>
          
          <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600">Avg Rating</p>
                <p className="text-lg md:text-2xl font-bold text-yellow-600">
                  {(arenas.reduce((acc, arena) => acc + arena.rating, 0) / arenas.length).toFixed(1)}
                </p>
              </div>
              <FaStar className="text-yellow-500 text-xl md:text-2xl" />
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Cari arena atau alamat..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <FaFilter size={12} />
              Filter
              {showFilters ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urutkan</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="name">Nama Arena</option>
                  <option value="rating">Rating</option>
                  <option value="price_per_hour">Harga</option>
                  <option value="total_bookings">Total Booking</option>
                  <option value="created_at">Tanggal Dibuat</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>
            Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, arenas.length)} dari {arenas.length} arena
          </span>
          <span>
            Halaman {currentPage} dari {totalPages}
          </span>
        </div>

        {/* Arena List - Desktop Table */}
        <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Arena
                      {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('rating')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Rating
                      {sortBy === 'rating' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lokasi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('price_per_hour')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Harga/Jam
                      {sortBy === 'price_per_hour' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lapangan
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedArenas.map((arena) => (
                  <tr key={arena.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={arena.image_url}
                          alt={arena.name}
                          className="h-12 w-12 rounded-lg object-cover mr-4"
                          onError={(e) => {
                            e.target.src = '/foto_lapangan.png';
                          }}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{arena.name}</div>
                          <div className="text-sm text-gray-500">{arena.opening_hours}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaStar className="text-yellow-400 mr-1" size={12} />
                        <span className="text-sm font-medium">{arena.rating}</span>
                        <span className="text-sm text-gray-500 ml-1">({arena.reviews_count})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{arena.city}</div>
                      <div className="text-sm text-gray-500 truncate max-w-[150px]">{arena.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        Rp {arena.price_per_hour ? arena.price_per_hour.toLocaleString('id-ID') : '0'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={arena.status}
                        onChange={(e) => handleStatusChange(arena.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full border-0 ${getStatusColor(arena.status)} focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="active">Aktif</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="inactive">Nonaktif</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{arena.courts_count} lapangan</div>
                      <div className="text-sm text-gray-500">{arena.total_bookings} booking</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => navigate(`/admin/arenas/${arena.id}`)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Lihat Detail"
                        >
                          <FaEye size={14} />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/arenas/edit/${arena.id}`)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Edit Arena"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(arena.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Hapus Arena"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Arena List - Mobile Cards */}
        <div className="md:hidden space-y-4">
          {paginatedArenas.map((arena) => (
            <div key={arena.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex gap-3">
                <img
                  src={arena.image_url}
                  alt={arena.name}
                  className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                  onError={(e) => {
                    e.target.src = '/foto_lapangan.png';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{arena.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(arena.status)}`}>
                      {getStatusText(arena.status)}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <FaMapMarkerAlt size={10} />
                      <span className="truncate">{arena.city}, {arena.address}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaStar className="text-yellow-400" size={10} />
                      <span>{arena.rating} ({arena.reviews_count} ulasan)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaClock size={10} />
                      <span>{arena.opening_hours}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3">
                    <div className="text-sm font-medium text-gray-900">
                      Rp {arena.price_per_hour ? arena.price_per_hour.toLocaleString('id-ID') : '0'}/jam
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/admin/arenas/${arena.id}`)}
                        className="text-blue-600 p-1"
                      >
                        <FaEye size={14} />
                      </button>
                      <button
                        onClick={() => navigate(`/admin/arenas/edit/${arena.id}`)}
                        className="text-green-600 p-1"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(arena.id)}
                        className="text-red-600 p-1"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
            >
              Sebelumnya
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-2 border rounded-lg text-sm ${
                  currentPage === i + 1 
                    ? 'bg-sporta-blue text-white border-sporta-blue' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
            >
              Selanjutnya
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <FaSpinner className="animate-spin text-4xl text-sporta-blue mx-auto mb-4" />
            <p className="text-gray-600">Memuat data arena...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && arenas.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">🏸</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada arena ditemukan</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || selectedCity !== 'Semua Kota' || selectedStatus !== 'Semua Status'
                ? 'Coba ubah filter pencarian Anda'
                : 'Belum ada arena yang terdaftar'}
            </p>
            {!searchQuery && selectedCity === 'Semua Kota' && selectedStatus === 'Semua Status' && (
              <button
                onClick={() => navigate('/admin/arenas/add')}
                className="bg-sporta-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Tambah Arena Pertama
              </button>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default ArenaManagement;