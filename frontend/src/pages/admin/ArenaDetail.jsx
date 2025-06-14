import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { ArenaService } from '../../services/apiService';
import { toast } from 'react-toastify';
import { 
  FaEdit, 
  FaTrash, 
  FaArrowLeft,
  FaMapMarkerAlt,
  FaClock,
  FaDollarSign,
  FaPhone,
  FaEnvelope,
  FaGlobe,
  FaStar,
  FaUsers,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaWrench,
  FaChartLine,
  FaImage,
  FaSpinner
} from 'react-icons/fa';

function ArenaDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [arena, setArena] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadArenaDetail = async () => {
      try {
        setLoading(true);
        console.log(`Fetching arena with ID: ${id}`);
        const data = await ArenaService.getArenaById(id);
        console.log('Arena data received:', data);
        
        // Extract arena data from response
        const arenaData = data.arena || data;
        
        // Add default values for missing properties to prevent errors
        const processedArena = {
          ...arenaData,
          facilities: arenaData.facilities || [],
          policies: arenaData.policies || [],
          courts: arenaData.courts || [],
          reviews_count: arenaData.reviews_count || 0,
          rating: arenaData.rating || 0,
          total_bookings: arenaData.total_bookings || 0,
          // Memastikan image_url ada dan valid
          image_url: arenaData.image_url 
                    ? (arenaData.image_url.startsWith('http') || arenaData.image_url.startsWith('/') 
                      ? arenaData.image_url 
                      : '/' + arenaData.image_url)
                    : '/foto_lapangan.png',
          // Add default statistics if missing
          statistics: arenaData.statistics || {
            monthly_revenue: 0,
            monthly_bookings: 0,
            occupancy_rate: 0,
            avg_session_duration: 0,
            peak_hours: 'N/A',
            busiest_day: 'N/A'
          }
        };
        
        console.log('Processed arena with image path:', processedArena.image_url);
        setArena(processedArena);
      } catch (error) {
        console.error('Error loading arena detail:', error);
        toast.error('Gagal memuat detail arena');
        navigate('/admin/arenas');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadArenaDetail();
    }
  }, [id, navigate]);

  const handleDelete = async () => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus arena "${arena.name}"? Tindakan ini tidak dapat dibatalkan.`)) {
      try {
        // Simulate API call for now
        // TODO: Implement real API call to delete arena
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast.success('Arena berhasil dihapus!');
        navigate('/admin/arenas');
      } catch (error) {
        console.error('Error deleting arena:', error);
        toast.error('Gagal menghapus arena. Silakan coba lagi.');
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <FaCheckCircle className="text-green-500" />;
      case 'maintenance': return <FaWrench className="text-yellow-500" />;
      case 'inactive': return <FaTimesCircle className="text-red-500" />;
      default: return null;
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-sporta-blue mx-auto mb-4" />
            <p className="text-gray-600">Memuat detail arena...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!arena) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Arena Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-4">Arena dengan ID {id} tidak dapat ditemukan.</p>
          <button
            onClick={() => navigate('/admin/arenas')}
            className="bg-sporta-blue text-white px-4 py-2 rounded-lg"
          >
            Kembali ke Daftar Arena
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/arenas')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <FaArrowLeft size={16} />
              Kembali
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{arena.name}</h1>
              <p className="text-gray-600 mt-1">Detail informasi arena badminton</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/admin/arenas/edit/${arena.id}`)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaEdit size={14} />
              Edit Arena
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <FaTrash size={14} />
              Hapus Arena
            </button>
          </div>
        </div>

        {/* Arena Overview Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Arena Image */}
            <div className="lg:col-span-1">
              <img 
                src={arena.image_url} 
                alt={arena.name}
                className="w-full h-64 object-cover rounded-lg border border-gray-200"
              />
            </div>
            
            {/* Arena Info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(arena.status)}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(arena.status)}`}>
                    {getStatusText(arena.status)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <FaStar className="text-yellow-400" />
                  <span className="font-medium">{arena.rating}</span>
                  <span className="text-gray-500">({arena.reviews_count} ulasan)</span>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed">{arena.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-gray-400" />
                    <span className="text-sm">{arena.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaClock className="text-gray-400" />
                    <span className="text-sm">{arena.opening_hours}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaDollarSign className="text-gray-400" />
                    <span className="text-sm">Rp {arena.price_per_hour.toLocaleString('id-ID')}/jam</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {arena.phone && (
                    <div className="flex items-center gap-2">
                      <FaPhone className="text-gray-400" />
                      <span className="text-sm">{arena.phone}</span>
                    </div>
                  )}
                  {arena.email && (
                    <div className="flex items-center gap-2">
                      <FaEnvelope className="text-gray-400" />
                      <span className="text-sm">{arena.email}</span>
                    </div>
                  )}
                  {arena.website && (
                    <div className="flex items-center gap-2">
                      <FaGlobe className="text-gray-400" />
                      <a href={arena.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        Website Arena
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: FaChartLine },
                { id: 'courts', label: 'Lapangan', icon: FaUsers },
                { id: 'facilities', label: 'Fasilitas', icon: FaCheckCircle },
                { id: 'policies', label: 'Kebijakan', icon: FaCheckCircle }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-sporta-blue text-sporta-blue'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Statistik Arena</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Pendapatan Bulanan</p>
                        <p className="text-2xl font-bold text-blue-800">
                          Rp {arena.statistics.monthly_revenue.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <FaDollarSign className="text-blue-500 text-2xl" />
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 font-medium">Booking Bulanan</p>
                        <p className="text-2xl font-bold text-green-800">{arena.statistics.monthly_bookings}</p>
                      </div>
                      <FaCalendarAlt className="text-green-500 text-2xl" />
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-yellow-600 font-medium">Tingkat Okupansi</p>
                        <p className="text-2xl font-bold text-yellow-800">{arena.statistics.occupancy_rate}%</p>
                      </div>
                      <FaChartLine className="text-yellow-500 text-2xl" />
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600 font-medium">Total Booking</p>
                        <p className="text-2xl font-bold text-purple-800">{arena.total_bookings}</p>
                      </div>
                      <FaUsers className="text-purple-500 text-2xl" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-3">Informasi Operasional</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Durasi Sesi Rata-rata:</span>
                        <span className="font-medium">{arena.statistics.avg_session_duration} jam</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Jam Sibuk:</span>
                        <span className="font-medium">{arena.statistics.peak_hours}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hari Tersibuk:</span>
                        <span className="font-medium">{arena.statistics.busiest_day}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-3">Informasi Arena</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tanggal Dibuat:</span>
                        <span className="font-medium">{new Date(arena.created_at).toLocaleDateString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Terakhir Diperbarui:</span>
                        <span className="font-medium">{new Date(arena.updated_at).toLocaleDateString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Jumlah Lapangan:</span>
                        <span className="font-medium">{arena.courts.length} lapangan</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Courts Tab */}
            {activeTab === 'courts' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Daftar Lapangan ({arena.courts.length})</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {arena.courts.map(court => (
                    <div key={court.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-gray-800">{court.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(court.status)}`}>
                          {getStatusText(court.status)}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Harga per Jam:</span>
                          <span className="font-medium">Rp {court.price_per_hour.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Booking:</span>
                          <span className="font-medium">{court.total_bookings} kali</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Booking Terakhir:</span>
                          <span className="font-medium">{court.last_booking}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Facilities Tab */}
            {activeTab === 'facilities' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Fasilitas Arena</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {arena.facilities.map(facility => (
                    <div key={facility} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                      <FaCheckCircle className="text-green-500" size={16} />
                      <span className="text-sm font-medium text-green-800">{facility}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Policies Tab */}
            {activeTab === 'policies' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Kebijakan Arena</h3>
                
                <div className="space-y-3">
                  {arena.policies.map((policy, index) => (
                    <div key={index} className="flex gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="text-sm text-blue-800">{policy}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default ArenaDetail;