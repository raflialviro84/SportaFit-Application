import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { FaCalendarAlt, FaUser, FaExclamationCircle, FaCheck, FaTrash, FaSearch, FaBell } from 'react-icons/fa';

function NotificationManagement() {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  // Simulasi mengambil data notifikasi
  useEffect(() => {
    // Data notifikasi contoh yang lebih banyak
    const dummyNotifications = [
      {
        id: 1,
        type: 'booking',
        title: 'Pemesanan Baru',
        message: 'Ada pemesanan baru dari Budi Santoso',
        time: '10 menit yang lalu',
        date: '13 Juni 2025',
        read: false,
        icon: <FaCalendarAlt className="text-blue-500" />
      },
      {
        id: 2,
        type: 'user',
        title: 'Pengguna Baru',
        message: 'Siti Rahayu baru saja mendaftar',
        time: '30 menit yang lalu',
        date: '13 Juni 2025',
        read: false,
        icon: <FaUser className="text-green-500" />
      },
      {
        id: 3,
        type: 'system',
        title: 'Peringatan Sistem',
        message: 'Kapasitas penyimpanan hampir penuh (85%)',
        time: '1 jam yang lalu',
        date: '13 Juni 2025',
        read: true,
        icon: <FaExclamationCircle className="text-yellow-500" />
      },
      {
        id: 4,
        type: 'booking',
        title: 'Pembatalan Pemesanan',
        message: 'Pemesanan #12345 telah dibatalkan',
        time: '3 jam yang lalu',
        date: '13 Juni 2025',
        read: true,
        icon: <FaCalendarAlt className="text-red-500" />
      },
      {
        id: 5,
        type: 'system',
        title: 'Pembaruan Berhasil',
        message: 'Sistem telah diperbarui ke versi terbaru',
        time: '1 hari yang lalu',
        date: '12 Juni 2025',
        read: true,
        icon: <FaCheck className="text-green-500" />
      },
      {
        id: 6,
        type: 'booking',
        title: 'Pemesanan Selesai',
        message: 'Pemesanan #10923 telah selesai',
        time: '1 hari yang lalu',
        date: '12 Juni 2025',
        read: true,
        icon: <FaCalendarAlt className="text-green-500" />
      },
      {
        id: 7,
        type: 'user',
        title: 'Permintaan Refund',
        message: 'Pengguna Arief meminta refund untuk pemesanan #8712',
        time: '2 hari yang lalu',
        date: '11 Juni 2025',
        read: true,
        icon: <FaUser className="text-orange-500" />
      },
      {
        id: 8,
        type: 'system',
        title: 'Backup Otomatis',
        message: 'Backup otomatis database berhasil dilakukan',
        time: '3 hari yang lalu',
        date: '10 Juni 2025',
        read: true,
        icon: <FaCheck className="text-blue-500" />
      },
      {
        id: 9,
        type: 'booking',
        title: 'Pemesanan Baru',
        message: 'Ada pemesanan baru dari Ahmad Fadli',
        time: '3 hari yang lalu',
        date: '10 Juni 2025',
        read: true,
        icon: <FaCalendarAlt className="text-blue-500" />
      },
      {
        id: 10,
        type: 'user',
        title: 'Pengguna Baru',
        message: 'Arya Permana baru saja mendaftar',
        time: '4 hari yang lalu',
        date: '9 Juni 2025',
        read: true,
        icon: <FaUser className="text-green-500" />
      },
    ];
    
    setNotifications(dummyNotifications);
    setFilteredNotifications(dummyNotifications);
  }, []);

  // Filter notifikasi berdasarkan kategori
  useEffect(() => {
    let result = [...notifications];
    
    // Filter berdasarkan kategori
    if (activeFilter !== 'all') {
      result = result.filter(item => item.type === activeFilter);
    }
    
    // Filter berdasarkan pencarian
    if (searchTerm) {
      result = result.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredNotifications(result);
  }, [activeFilter, searchTerm, notifications]);

  // Menandai notifikasi sebagai telah dibaca
  const markAsRead = (id) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Menandai semua notifikasi sebagai telah dibaca
  const markAllAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
  };

  // Menghapus notifikasi
  const deleteNotification = (id) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== id)
    );
    setSelectedNotifications(prevSelected => 
      prevSelected.filter(notificationId => notificationId !== id)
    );
  };

  // Menghapus beberapa notifikasi yang dipilih
  const deleteSelectedNotifications = () => {
    if (selectedNotifications.length === 0) return;
    
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => !selectedNotifications.includes(notification.id))
    );
    setSelectedNotifications([]);
  };

  // Mengelola pilihan notifikasi
  const toggleSelectNotification = (id) => {
    setSelectedNotifications(prevSelected => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter(notificationId => notificationId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  // Pilih semua notifikasi yang ditampilkan
  const selectAllDisplayed = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(notification => notification.id));
    }
  };

  // Kategori filter
  const filterCategories = [
    { id: 'all', label: 'Semua' },
    { id: 'booking', label: 'Pemesanan', icon: <FaCalendarAlt /> },
    { id: 'user', label: 'Pengguna', icon: <FaUser /> },
    { id: 'system', label: 'Sistem', icon: <FaExclamationCircle /> }
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Manajemen Notifikasi</h1>
          <p className="text-gray-600">Kelola semua notifikasi sistem</p>
        </div>

        {/* Filter dan Pencarian */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
            {/* Filter Kategori */}
            <div className="flex flex-wrap gap-2">
              {filterCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveFilter(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 ${
                    activeFilter === category.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.icon && <span>{category.icon}</span>}
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
            
            {/* Pencarian */}
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari notifikasi..."
                className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Toolbar Aksi */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap justify-between items-center">
            <div className="flex items-center space-x-2 mb-3 md:mb-0">
              <input
                type="checkbox"
                className="rounded text-blue-600 focus:ring-blue-500"
                checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                onChange={selectAllDisplayed}
              />
              <span className="text-sm text-gray-700">
                {selectedNotifications.length} dipilih
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center space-x-2"
                disabled={notifications.filter(n => !n.read).length === 0}
              >
                <FaCheck />
                <span>Tandai Semua Dibaca</span>
              </button>
              
              <button
                onClick={deleteSelectedNotifications}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center space-x-2"
                disabled={selectedNotifications.length === 0}
              >
                <FaTrash />
                <span>Hapus Terpilih</span>
              </button>
            </div>
          </div>
        </div>

        {/* Daftar Notifikasi */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${notification.read ? '' : 'bg-blue-50'}`}
                >
                  <div className="flex items-start">
                    <div className="mr-4">
                      <input
                        type="checkbox"
                        className="rounded text-blue-600 focus:ring-blue-500 mt-1"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => toggleSelectNotification(notification.id)}
                      />
                    </div>
                    
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        {notification.icon || <FaBell className="text-gray-500" />}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className={`text-sm font-medium ${notification.read ? 'text-gray-900' : 'text-blue-700'}`}>
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        </div>
                        
                        <div className="ml-4 flex-shrink-0 flex flex-col items-end">
                          <span className="text-xs text-gray-500">{notification.time}</span>
                          <span className="text-xs text-gray-400 mt-1">{notification.date}</span>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex justify-between items-center">
                        <div className="flex space-x-2">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Tandai telah dibaca
                            </button>
                          )}
                        </div>
                        
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <FaBell className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada notifikasi</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Tidak ada notifikasi yang cocok dengan pencarian Anda.' : 'Anda tidak memiliki notifikasi saat ini.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default NotificationManagement;