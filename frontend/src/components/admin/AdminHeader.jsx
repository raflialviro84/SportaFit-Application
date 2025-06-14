import React from 'react';
import { Link } from 'react-router-dom';

const AdminHeader = ({ title }) => {
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{adminUser.name || 'Admin'}</span>
          </div>
          <div className="relative">
            <Link 
              to="/admin/dashboard" 
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;