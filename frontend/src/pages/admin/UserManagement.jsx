import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaSearch, FaPlus, FaFilter, FaEye, FaEdit, FaTrash, FaAngleDoubleLeft, FaAngleLeft, FaAngleRight, FaAngleDoubleRight, FaUsers, FaUserTie, FaUserCog, FaUserCheck, FaUserSlash, FaUserShield, FaTimes, FaUndo } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight, FiSearch, FiFilter, FiEdit, FiTrash2, FiUsers } from 'react-icons/fi';
import { toast } from 'react-toastify';
import AdminLayout from '../../layouts/AdminLayout';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import { getUserStats, getAllUsers, deleteUser } from '../../services/userService';

const StatCard = ({ title, value, icon, color }) => {
  const [iconSize, setIconSize] = useState(18);
  
  useEffect(() => {
    const handleResize = () => {
      setIconSize(window.innerWidth < 768 ? 14 : 18);
    };
    
    // Set initial size
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <div className={`${color} p-3 md:p-4 rounded-md shadow-sm flex items-center justify-between transition-all duration-200`}>
      <div className="flex items-center w-full">
        <div className="rounded-full p-2 md:p-3 bg-white mr-2 md:mr-4 flex items-center justify-center shrink-0">
          {React.cloneElement(icon, { size: iconSize })}
        </div>
        <div className="overflow-hidden w-full">
          <div className="text-xs md:text-base font-semibold truncate">
            {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
          </div>
          <div className="text-xs md:text-sm text-gray-600 truncate">{title}</div>
        </div>
      </div>
    </div>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [paginatedUsers, setPaginatedUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    newUsersThisMonth: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sorting, setSorting] = useState({ field: 'id', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    itemsPerPage: 10
  });

  const resetFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
    setSorting({ field: 'id', direction: 'asc' });
  };

  // Fetch users and stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch users data - passing currentPage untuk pagination
        const usersResponse = await getAllUsers(currentPage, itemsPerPage, searchTerm, roleFilter === 'all' ? '' : roleFilter, statusFilter === 'all' ? '' : statusFilter);
        
        // Extract users array from response - API returns {users: [...]} structure
        const usersData = usersResponse.users || [];
        
        // Map the data to ensure consistent field names
        const formattedUsers = usersData.map(user => ({
          id: user.id,
          name: user.name || 'Unknown',
          email: user.email || '',
          phone: user.phone || '',
          role: user.role || 'user',
          // Handle different status field possibilities
          status: user.status || 'active',
          // Handle different date field name possibilities
          createdAt: user.createdAt || user.created_at || new Date().toISOString()
        }));
        
        console.log("Users data fetched and formatted:", formattedUsers);
        console.log("Complete users response:", usersResponse);
        
        // Set users state with formatted data
        setUsers(formattedUsers);
        setPaginatedUsers(formattedUsers);
        
        // Fetch stats data
        const statsResponse = await getUserStats();
        
        console.log("Stats data fetched:", statsResponse);
        
        // Set stats state - API returns stats directly
        setStats({
          totalUsers: statsResponse.totalUsers || 0,
          activeUsers: statsResponse.activeUsers || 0,
          inactiveUsers: statsResponse.inactiveUsers || 0,
          newUsersThisMonth: statsResponse.newUsersThisMonth || 0
        });
        
        // Use pagination from API response
        if (usersResponse.pagination) {
          setPagination({
            totalItems: usersResponse.pagination.totalUsers || statsResponse.totalUsers || 0,
            totalPages: Math.max(1, Math.ceil((usersResponse.pagination.totalUsers || statsResponse.totalUsers || 0) / itemsPerPage)),
            currentPage: currentPage,
            itemsPerPage
          });
        } else {
          // Fallback to calculating pagination based on stats
          setPagination({
            totalItems: statsResponse.totalUsers || 0,
            totalPages: Math.max(1, Math.ceil((statsResponse.totalUsers || 0) / itemsPerPage)),
            currentPage: currentPage,
            itemsPerPage
          });
        }
        
      } catch (error) {
        console.error('Error fetching users data:', error);
        toast.error('Gagal memuat data pengguna');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, itemsPerPage, searchTerm, roleFilter, statusFilter]);

  // Set filtered users directly from users since filtering now handled by API
  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

  const handleSort = (field) => {
    const direction = sorting.field === field && sorting.direction === 'asc' ? 'desc' : 'asc';
    setSorting({ field, direction });
  };

  const renderSortIcon = (field) => {
    if (sorting.field !== field) return null;
    return sorting.direction === 'asc' ? '↑' : '↓';
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    setCurrentPage(page);
    // Untuk memastikan halaman berubah dan data terambil ulang
    console.log(`Changing page to ${page}`);
  };

  const handleDeleteUser = (userId) => {
    setUserToDelete(userId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await deleteUser(userToDelete);
      setUsers(prev => Array.isArray(prev) ? prev.filter(user => user.id !== userToDelete) : []);
      toast.success('Pengguna berhasil dihapus');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Gagal menghapus pengguna');
    } finally {
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'user': return 'Pengguna';
      case 'staff': return 'Staf';
      default: return 'Unknown';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'inactive': return 'Tidak Aktif';
      case 'suspended': return 'Suspended';
      default: return 'Unknown';
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'staff': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const totalPages = pagination.totalPages;

  // Pagination controls
  const Pagination = () => {
    // Create a dynamic array of page numbers to show based on current page
    const getPageNumbers = () => {
      const pageNumbers = [];
      
      // For small number of pages, show all pages
      if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
        return pageNumbers;
      }
      
      // Always include first page, last page, current page and pages adjacent to current page
      pageNumbers.push(1);
      
      if (currentPage > 3) {
        pageNumbers.push('...');
      }
      
      // Pages around current page
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pageNumbers.push('...');
      }
      
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
      
      return pageNumbers;
    };
    
    const pageNumbers = getPageNumbers();
    
    return (
      <div className="flex flex-wrap justify-center md:justify-between items-center mt-4 p-3 pb-4">
        <div className="text-xs md:text-sm text-gray-600 mb-3 md:mb-0 w-full md:w-auto text-center md:text-left">
          Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, pagination.totalItems)} dari {pagination.totalItems} pengguna
        </div>
        
        <div className="flex items-center space-x-1 md:space-x-2">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className={`hidden md:flex px-2 py-1 rounded ${
              currentPage === 1 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
            aria-label="First page"
          >
            <FaAngleDoubleLeft size={14} />
          </button>
          
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-2 py-1 md:px-3 md:py-1.5 rounded ${
              currentPage === 1 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            aria-label="Previous page"
          >
            <FiChevronLeft size={14} />
          </button>
          
          <div className="hidden md:flex space-x-1">
            {pageNumbers.map((number, index) => (
              number === '...' ? (
                <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-600">...</span>
              ) : (
                <button
                  key={number}
                  onClick={() => handlePageChange(number)}
                  className={`px-3 py-1 rounded ${
                    currentPage === number
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {number}
                </button>
              )
            ))}
          </div>
          
          <div className="flex md:hidden">
            <span className="px-3 py-1 bg-gray-100 rounded">
              {currentPage} / {totalPages}
            </span>
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className={`px-2 py-1 md:px-3 md:py-1.5 rounded ${
              currentPage === totalPages || totalPages === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            aria-label="Next page"
          >
            <FiChevronRight size={14} />
          </button>
          
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages || totalPages === 0}
            className={`hidden md:flex px-2 py-1 rounded ${
              currentPage === totalPages || totalPages === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
            aria-label="Last page"
          >
            <FaAngleDoubleRight size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="w-full px-2 md:px-4 lg:px-6 space-y-3">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
            <p className="text-sm text-gray-600">Kelola semua pengguna sistem SportaFit</p>
          </div>
          <Link
            to="/admin/users/add"
            className="flex items-center justify-center gap-1 bg-sporta-blue text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto text-sm"
          >
            <FaPlus size={12} />
            Tambah Pengguna
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <StatCard 
            title="Total Pengguna" 
            value={stats.totalUsers || 0}
            icon={<FaUsers className="text-blue-500" />}
            color="bg-blue-50"
          />
          <StatCard 
            title="Pengguna Aktif" 
            value={stats.activeUsers || 0}
            icon={<FaUserCheck className="text-green-500" />}
            color="bg-green-50"
          />
          <StatCard 
            title="Tidak Aktif" 
            value={stats.inactiveUsers || 0}
            icon={<FaUser className="text-red-500" />}
            color="bg-red-50"
          />
          <StatCard 
            title="Baru Bulan Ini" 
            value={stats.newUsersThisMonth || 0}
            icon={<FaUser className="text-orange-500" />}
            color="bg-orange-50"
          />
        </div>
        
        {/* Filters and Search */}
        <div className="bg-white p-3 md:p-4 rounded-md shadow-sm mb-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center mb-3">
            <div className="flex-grow md:max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari pengguna..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes size={14} />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
                <option value="suspended">Diblokir</option>
              </select>
              
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              >
                <option value="all">Semua Role</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="arena_owner">Pemilik Arena</option>
              </select>
              
              <select
                value={sorting.field}
                onChange={(e) => handleSort(e.target.value)}
                className="border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              >
                <option value="id">ID</option>
                <option value="name">Nama</option>
                <option value="email">Email</option>
                <option value="phone">Telepon</option>
                <option value="role">Role</option>
                <option value="status">Status</option>
                <option value="createdAt">Bergabung</option>
              </select>
              
              <button
                onClick={resetFilters}
                className="border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 text-sm flex items-center gap-1"
              >
                <FaUndo size={12} />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>
          
          {/* Filter Tags */}
          {(searchTerm || statusFilter !== 'all' || roleFilter !== 'all') && (
            <div className="flex flex-wrap gap-2 mt-2">
              {searchTerm && (
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs flex items-center">
                  <span>Pencarian: {searchTerm}</span>
                  <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-blue-900">
                    <FaTimes size={10} />
                  </button>
                </div>
              )}
              
              {statusFilter !== 'all' && (
                <div className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs flex items-center">
                  <span>Status: {statusFilter}</span>
                  <button onClick={() => setStatusFilter('all')} className="ml-1 hover:text-green-900">
                    <FaTimes size={10} />
                  </button>
                </div>
              )}
              
              {roleFilter !== 'all' && (
                <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-xs flex items-center">
                  <span>Role: {roleFilter}</span>
                  <button onClick={() => setRoleFilter('all')} className="ml-1 hover:text-purple-900">
                    <FaTimes size={10} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Table */}
        <div className="bg-white rounded-md shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pengguna
                  </th>
                  <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bergabung
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  Array(5).fill(0).map((_, index) => (
                    <tr key={index}>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
                          <div className="ml-3">
                            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                            <div className="mt-1 h-3 w-24 bg-gray-100 rounded animate-pulse"></div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-4 py-4">
                        <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-4">
                        <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-4">
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse ml-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <FaSearch className="text-gray-300 mb-2" size={24} />
                        <p>Tidak ada pengguna yang ditemukan</p>
                        <button 
                          onClick={resetFilters} 
                          className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Reset semua filter
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            {user.avatar ? (
                              <img 
                                src={user.avatar} 
                                alt={user.name} 
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-blue-700 font-medium">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-xs text-gray-500 md:hidden">
                              {user.email}
                            </div>
                            <div className="text-xs text-gray-500 sm:hidden mt-1">
                              {getRoleText(user.role)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-4 py-4 text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="hidden sm:table-cell px-4 py-4 text-sm">
                        {getRoleText(user.role)}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {getStatusText(user.status)}
                      </td>
                      <td className="hidden sm:table-cell px-4 py-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end items-center space-x-2">
                          <Link
                            to={`/admin/users/${user.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FaEye size={16} className="sm:hidden" />
                            <span className="hidden sm:block">Detail</span>
                          </Link>
                          <Link
                            to={`/admin/users/edit/${user.id}`}
                            className="text-yellow-600 hover:text-yellow-800"
                            title="Edit"
                          >
                            <FaEdit size={14} />
                          </Link>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Hapus"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {!loading && filteredUsers.length > 0 && (
            <div className="flex justify-center items-center gap-1 mt-4 py-4">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || loading}
                className="px-2 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-xs"
              >
                Prev
              </button>

              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={loading}
                    className={`px-2 py-1 border rounded-lg text-xs ${
                      currentPage === pageNum
                        ? 'bg-sporta-blue text-white border-sporta-blue'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || loading}
                className="px-2 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-xs"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      {isDeleteModalOpen && (
        <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Konfirmasi Hapus</h3>
            <p className="text-sm text-gray-500 mb-4">
              Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}

export default UserManagement;