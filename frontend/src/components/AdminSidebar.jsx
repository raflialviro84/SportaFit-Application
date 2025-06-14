import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaBuilding,
  FaUsers,
  FaCalendarAlt,
  FaTicketAlt,
  FaCog,
  FaChevronRight
} from 'react-icons/fa';

function AdminSidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: FaTachometerAlt,
      path: '/admin/dashboard',
      description: 'Overview dan statistik utama'
    },
    {
      id: 'arenas',
      label: 'Manajemen Arena',
      icon: FaBuilding,
      path: '/admin/arenas',
      description: 'Kelola data arena dan lapangan'
    },
    {
      id: 'users',
      label: 'Manajemen User',
      icon: FaUsers,
      path: '/admin/users',
      description: 'Kelola data pengguna'
    },
    {
      id: 'bookings',
      label: 'Manajemen Booking',
      icon: FaCalendarAlt,
      path: '/admin/bookings',
      description: 'Kelola pemesanan lapangan'
    },
    {
      id: 'vouchers',
      label: 'Manajemen Voucher',
      icon: FaTicketAlt,
      path: '/admin/vouchers',
      description: 'Kelola promo dan voucher'
    },
    {
      id: 'settings',
      label: 'Pengaturan Sistem',
      icon: FaCog,
      path: '/admin/settings',
      description: 'Konfigurasi aplikasi'
    }
  ];

  const handleMenuClick = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:h-[calc(100vh-4rem)]
        w-80
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Menu Admin</h2>
            <p className="text-sm text-gray-500">Kelola sistem SportaFit</p>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.path)}
                  className={`
                    w-full flex items-center justify-between p-3 rounded-lg text-left
                    transition-all duration-200 group
                    ${isActive 
                      ? 'bg-sporta-blue text-white shadow-md' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <Icon 
                      size={20} 
                      className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-sporta-blue'}
                    />
                    <div>
                      <div className={`font-medium ${isActive ? 'text-white' : 'text-gray-900'}`}>
                        {item.label}
                      </div>
                      <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                  <FaChevronRight 
                    size={14} 
                    className={`
                      transition-transform duration-200
                      ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-sporta-blue'}
                      ${isActive ? 'transform rotate-90' : ''}
                    `}
                  />
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              SportaFit Admin Panel v1.0<br />
              © 2025 SportaFit Indonesia
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminSidebar;