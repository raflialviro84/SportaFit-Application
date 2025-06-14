import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaUserShield, FaBell, FaCheck, FaExclamationCircle, FaCalendarAlt, FaUser } from 'react-icons/fa';

function AdminNavbar() {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);
  
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  // Menutup dropdown notifikasi ketika klik di luar
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationRef]);

  // Mengambil data notifikasi (simulasi)
  useEffect(() => {
    // Data notifikasi contoh
    const dummyNotifications = [
      {
        id: 1,
        type: 'booking',
        title: 'Pemesanan Baru',
        message: 'Ada pemesanan baru dari Budi Santoso',
        time: '10 menit yang lalu',
        read: false,
        icon: <FaCalendarAlt className="text-blue-500" />
      },
      {
        id: 2,
        type: 'user',
        title: 'Pengguna Baru',
        message: 'Siti Rahayu baru saja mendaftar',
        time: '30 menit yang lalu',
        read: false,
        icon: <FaUser className="text-green-500" />
      },
      {
        id: 3,
        type: 'system',
        title: 'Peringatan Sistem',
        message: 'Kapasitas penyimpanan hampir penuh (85%)',
        time: '1 jam yang lalu',
        read: true,
        icon: <FaExclamationCircle className="text-yellow-500" />
      },
      {
        id: 4,
        type: 'booking',
        title: 'Pembatalan Pemesanan',
        message: 'Pemesanan #12345 telah dibatalkan',
        time: '3 jam yang lalu',
        read: true,
        icon: <FaCalendarAlt className="text-red-500" />
      },
      {
        id: 5,
        type: 'system',
        title: 'Pembaruan Berhasil',
        message: 'Sistem telah diperbarui ke versi terbaru',
        time: '1 hari yang lalu',
        read: true,
        icon: <FaCheck className="text-green-500" />
      }
    ];
    
    setNotifications(dummyNotifications);
    
    // Hitung notifikasi yang belum dibaca
    const unread = dummyNotifications.filter(item => !item.read).length;
    setUnreadCount(unread);
  }, []);

  // Menandai notifikasi sebagai telah dibaca
  const markAsRead = (id) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    
    // Update count unread
    const updatedUnread = notifications.filter(item => !item.read && item.id !== id).length;
    setUnreadCount(updatedUnread);
  };

  // Menandai semua notifikasi sebagai telah dibaca
  const markAllAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-[60]">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Title */}
          <div className="flex items-center">
            <img src="/Logo.png" alt="SportaFit" className="h-8 w-auto mr-3" />
            <div>
              <h1 className="text-xl font-bold text-sporta-blue">SportaFit Admin</h1>
              <p className="text-xs text-gray-500">Management Dashboard</p>
            </div>
          </div>

          {/* Right side - Admin info & actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button 
                className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Notifikasi"
              >
                <FaBell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              
              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50 border border-gray-200">
                  <div className="py-2">
                    <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100">
                      <h3 className="text-sm font-bold text-gray-700">Notifikasi</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Tandai semua telah dibaca
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map(notification => (
                          <div 
                            key={notification.id}
                            className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${notification.read ? '' : 'bg-blue-50'}`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex">
                              <div className="flex-shrink-0 mr-3 mt-1">
                                {notification.icon}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                <p className="text-sm text-gray-600">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                              </div>
                              {!notification.read && (
                                <div className="flex-shrink-0 ml-2">
                                  <span className="h-2 w-2 bg-blue-500 rounded-full block"></span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center text-gray-500">
                          <p>Tidak ada notifikasi</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="px-4 py-2 border-t border-gray-100 text-center">
                      <button 
                        onClick={() => navigate('/admin/notifications')}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Lihat semua notifikasi
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Profile */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <FaUserShield className="text-sporta-blue" size={20} />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {adminUser.name || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
              
              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <FaSignOutAlt size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default AdminNavbar;