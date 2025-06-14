import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaCalendarAlt,
  FaMoneyBillWave,
  FaTicketAlt, 
  FaHistory, 
  FaArrowLeft, 
  FaEdit, 
  FaBan, 
  FaCheckCircle, 
  FaTrash,
  FaClock,
  FaMapPin
} from 'react-icons/fa';
import AdminLayout from '../../layouts/AdminLayout';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { getUserById, deleteUser, updateUserStatus } from '../../services/userService';

// Status and role helpers
const getStatusText = (status) => {
  switch(status) {
    case 'active': return 'Aktif';
    case 'suspended': return 'Ditangguhkan';
    case 'inactive': return 'Tidak Aktif';
    default: return status;
  }
};

const getStatusColor = (status) => {
  switch(status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'suspended': return 'bg-yellow-100 text-yellow-800';
    case 'inactive': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getRoleText = (role) => {
  switch(role) {
    case 'admin': return 'Admin';
    case 'member': return 'Member';
    case 'arena_owner': return 'Pemilik Arena';
    default: return role;
  }
};

const getRoleColor = (role) => {
  switch(role) {
    case 'admin': return 'bg-purple-100 text-purple-800';
    case 'member': return 'bg-blue-100 text-blue-800';
    case 'arena_owner': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Booking status helpers
const getBookingStatusText = (status) => {
  switch(status) {
    case 'completed': return 'Selesai';
    case 'upcoming': return 'Akan Datang';
    case 'cancelled': return 'Dibatalkan';
    default: return status;
  }
};

const getBookingStatusColor = (status) => {
  switch(status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'upcoming': return 'bg-blue-100 text-blue-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Format dates
const formatDate = (dateString) => {
  try {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: id });
  } catch {
    return 'Invalid date';
  }
};

// Format booking date and time
const formatBookingDateTime = (date, timeSlot) => {
  try {
    const formattedDate = format(new Date(date), 'E, dd MMM yyyy', { locale: id });
    return `${formattedDate} • ${timeSlot}`;
  } catch {
    return 'Invalid date';
  }
};

function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        console.log(`Fetching user with ID: ${id}`);
        const response = await getUserById(id);
        console.log('User data received:', response);
        
        // Extract user data from response
        const userData = response.user || response;
        
        setUser(userData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(`Gagal memuat data pengguna: ${err.message}`);
        setLoading(false);
        toast.error('Gagal memuat data pengguna');
      }
    };

    if (id) {
      loadUser();
    }
  }, [id]);

  const handleSuspendUser = async () => {
    try {
      await updateUserStatus(id, 'suspended');
      toast.success('Pengguna berhasil ditangguhkan');
      setUser(prev => ({...prev, status: 'suspended'}));
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error('Gagal menangguhkan pengguna');
    }
  };

  const handleActivateUser = async () => {
    try {
      await updateUserStatus(id, 'active');
      toast.success('Pengguna berhasil diaktifkan');
      setUser(prev => ({...prev, status: 'active'}));
    } catch (error) {
      console.error('Error activating user:', error);
      toast.error('Gagal mengaktifkan pengguna');
    }
  };

  const handleDeleteUser = async () => {
    const confirmed = window.confirm('Anda yakin ingin menghapus pengguna ini?');
    if (confirmed) {
      try {
        await deleteUser(id);
        toast.success('Pengguna berhasil dihapus');
        navigate('/admin/users');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Gagal menghapus pengguna');
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto p-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-64 bg-gray-200 rounded w-full mb-4"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto p-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
          <div className="mt-4">
            <Link
              to="/admin/users"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <FaArrowLeft className="mr-2 -ml-1 h-5 w-5 text-gray-500" />
              Kembali ke Daftar Pengguna
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto p-4">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
            Pengguna tidak ditemukan
          </div>
          <div className="mt-4">
            <Link
              to="/admin/users"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <FaArrowLeft className="mr-2 -ml-1 h-5 w-5 text-gray-500" />
              Kembali ke Daftar Pengguna
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header and Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Link
              to="/admin/users"
              className="flex items-center justify-center bg-white border border-gray-300 rounded-lg p-2 hover:bg-gray-50 transition-colors"
            >
              <FaArrowLeft className="text-gray-500" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Detail Pengguna</h1>
              <p className="text-gray-600">Mengelola informasi dan aktivitas pengguna</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Link
              to={`/admin/users/edit/${user.id}`}
              className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FaEdit size={14} />
              Edit
            </Link>
            
            {user.role !== 'admin' && (
              <>
                {user.status === 'active' ? (
                  <button
                    onClick={handleSuspendUser}
                    className="flex items-center justify-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    <FaBan size={14} />
                    Tangguhkan
                  </button>
                ) : user.status === 'suspended' && (
                  <button
                    onClick={handleActivateUser}
                    className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <FaCheckCircle size={14} />
                    Aktifkan
                  </button>
                )}
                <button
                  onClick={handleDeleteUser}
                  className="flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  <FaTrash size={14} />
                  Hapus
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* User Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* User Avatar & Status */}
              <div className="flex flex-col items-center md:items-start">
                <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center text-4xl text-gray-500 mb-4">
                  {user.profile_picture ? (
                    <img 
                      src={user.profile_picture} 
                      alt={user.name} 
                      className="h-32 w-32 rounded-full object-cover" 
                    />
                  ) : (
                    <FaUser className="h-16 w-16 text-gray-400" />
                  )}
                </div>
                
                <div className="flex flex-col items-center md:items-start space-y-2 mb-4">
                  <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusColor(user.status)}`}>
                    {getStatusText(user.status)}
                  </span>
                  <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getRoleColor(user.role)}`}>
                    {getRoleText(user.role)}
                  </span>
                </div>
              </div>
              
              {/* User Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-start">
                    <FaEnvelope className="text-gray-400 mt-1 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaPhone className="text-gray-400 mt-1 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Telepon</p>
                      <p className="text-gray-900">{user.phone || '-'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaMapMarkerAlt className="text-gray-400 mt-1 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Kota</p>
                      <p className="text-gray-900">{user.city || '-'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaCalendarAlt className="text-gray-400 mt-1 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Tanggal Lahir</p>
                      <p className="text-gray-900">{user.birthdate ? formatDate(user.birthdate) : '-'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaCalendarAlt className="text-gray-400 mt-1 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Terdaftar Sejak</p>
                      <p className="text-gray-900">{formatDate(user.created_at)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaClock className="text-gray-400 mt-1 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Login Terakhir</p>
                      <p className="text-gray-900">{user.last_login ? formatDate(user.last_login) : '-'}</p>
                    </div>
                  </div>
                </div>
                
                {user.address && (
                  <div className="flex items-start mb-4">
                    <FaMapPin className="text-gray-400 mt-1 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Alamat Lengkap</p>
                      <p className="text-gray-900">{user.address}</p>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <FaTicketAlt className="text-blue-500 mr-2" />
                      <h3 className="font-semibold text-blue-700">Total Booking</h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">{user.total_bookings || 0}</p>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <FaMoneyBillWave className="text-green-500 mr-2" />
                      <h3 className="font-semibold text-green-700">Total Pengeluaran</h3>
                    </div>
                    <p className="text-2xl font-bold text-green-900">
                      Rp {user.total_spent ? user.total_spent.toLocaleString('id-ID') : '0'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'border-sporta-blue text-sporta-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaUser className="inline-block mr-2" />
                Profil
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'bookings'
                    ? 'border-sporta-blue text-sporta-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaHistory className="inline-block mr-2" />
                Riwayat Booking
              </button>
              <button
                onClick={() => setActiveTab('vouchers')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'vouchers'
                    ? 'border-sporta-blue text-sporta-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaTicketAlt className="inline-block mr-2" />
                Voucher
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Informasi Profil</h3>
                <p className="text-gray-500">
                  Informasi lengkap tentang pengguna ini sudah ditampilkan di kartu profil di atas.
                </p>
              </div>
            )}
            
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Riwayat Booking</h3>
                  <Link 
                    to={`/admin/bookings?userId=${user.id}`}
                    className="text-sporta-blue hover:text-blue-700 text-sm font-medium"
                  >
                    Lihat Semua
                  </Link>
                </div>
                
                {user.recent_bookings && user.recent_bookings.length > 0 ? (
                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              ID Booking
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Arena & Lapangan
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Waktu
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Harga
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {user.recent_bookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {booking.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="font-medium text-gray-900">{booking.arena_name}</div>
                                <div className="text-gray-500">{booking.court_name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatBookingDateTime(booking.date, booking.time_slot)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getBookingStatusColor(booking.status)}`}>
                                  {getBookingStatusText(booking.status)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                Rp {booking.amount.toLocaleString('id-ID')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <FaTicketAlt className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada booking</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Pengguna ini belum pernah melakukan booking lapangan.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'vouchers' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Voucher</h3>
                  <Link 
                    to={`/admin/vouchers?userId=${user.id}`}
                    className="text-sporta-blue hover:text-blue-700 text-sm font-medium"
                  >
                    Kelola Voucher
                  </Link>
                </div>
                
                {user.vouchers && user.vouchers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.vouchers.map((voucher) => (
                      <div key={voucher.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-900">{voucher.name}</div>
                          <div className="text-sm text-gray-500">
                            Berlaku hingga: {formatDate(voucher.expiry)}
                          </div>
                        </div>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${voucher.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {voucher.status === 'active' ? 'Aktif' : 'Terpakai'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <FaTicketAlt className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada voucher</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Pengguna ini belum memiliki voucher.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default UserDetail;