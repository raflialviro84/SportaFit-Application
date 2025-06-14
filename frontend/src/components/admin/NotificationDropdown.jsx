import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaBell, FaCalendarAlt, FaUser, FaExclamationCircle, FaCheck } from 'react-icons/fa';

function NotificationDropdown({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // Data notifikasi dummy
  useEffect(() => {
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
    setUnreadCount(dummyNotifications.filter(notif => !notif.read).length);
  }, []);

  // Menandai notifikasi sebagai telah dibaca
  const markAsRead = (id) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    
    // Update unread count
    setUnreadCount(prevCount => Math.max(0, prevCount - 1));
  };

  // Menandai semua notifikasi sebagai telah dibaca
  const markAllAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-1 z-50 max-h-[80vh] overflow-y-auto"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Notifikasi</h3>
          <button 
            onClick={markAllAsRead}
            className="text-xs text-blue-600 hover:text-blue-800"
            disabled={unreadCount === 0}
          >
            Tandai semua dibaca
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {unreadCount > 0 ? `Anda memiliki ${unreadCount} notifikasi belum dibaca` : 'Tidak ada notifikasi baru'}
        </p>
      </div>

      {/* Notification List */}
      <div className="divide-y divide-gray-100">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`px-4 py-3 hover:bg-gray-50 transition-colors ${notification.read ? '' : 'bg-blue-50'}`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                    {notification.icon || <FaBell className="text-gray-500" />}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${notification.read ? 'text-gray-900' : 'text-blue-700'}`}>
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-1 truncate">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {notification.time}
                  </p>
                </div>
                {!notification.read && (
                  <div className="ml-3 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-6 text-center">
            <FaBell className="mx-auto h-10 w-10 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">Tidak ada notifikasi</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 text-center border-t border-gray-200">
        <Link 
          to="/admin/notifications"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          onClick={onClose}
        >
          Lihat semua notifikasi
        </Link>
      </div>
    </div>
  );
}

export default NotificationDropdown;