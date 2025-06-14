import React, { useState } from 'react';
import { FaBars } from 'react-icons/fa';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';

function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <AdminNavbar />
      
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Mobile Menu Button */}
          <div className="lg:hidden p-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
            >
              <FaBars size={16} />
              <span className="text-sm font-medium">Menu</span>
            </button>
          </div>
          
          {/* Page Content */}
          <div className="p-2 sm:p-4 lg:p-6">
            <div className="w-full max-w-full sm:max-w-full md:max-w-4xl mx-auto">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;