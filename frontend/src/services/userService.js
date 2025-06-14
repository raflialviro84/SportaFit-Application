// src/services/userService.js

import { API_BASE_URL } from "./apiService";

// Fungsi helper untuk mengambil token yang aktif
const getToken = () => {
  // Coba ambil token admin terlebih dahulu, jika tidak ada ambil token user biasa
  return localStorage.getItem("adminToken") || localStorage.getItem("token");
};

export const UserService = {
  // Mendapatkan profil user
  getProfile: async () => {
    try {
      const token = getToken();
      if (!token) throw new Error("Token tidak ditemukan");
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: {
          "Authorization": `Bearer ${token}`
        },
        credentials: "include"
      });
      if (response.status === 401) {
        // Token tidak valid/expired, hapus token
        localStorage.removeItem("token");
        throw new Error("Token tidak valid");
      }
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Gagal mengambil data profil");
      }
      return await response.json();
    } catch (error) {
      console.error("Error getting user profile:", error);
      throw error;
    }
  },

  // Mengupdate profil user
  updateProfile: async (userData) => {
    try {
      const token = getToken();
      if (!token) throw new Error("Token tidak ditemukan");
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: "include",
        body: JSON.stringify(userData)
      });
      if (response.status === 401) {
        // Token tidak valid/expired, hapus token
        localStorage.removeItem("token");
        throw new Error("Token tidak valid");
      }
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Gagal mengupdate profil");
      }
      return await response.json();
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  },

  // Mengubah password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const token = getToken();
      if (!token) throw new Error("Token tidak ditemukan");
      const response = await fetch(`${API_BASE_URL}/users/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword })
      });
      if (response.status === 401) {
        // Token tidak valid/expired, hapus token
        localStorage.removeItem("token");
        throw new Error("Token tidak valid");
      }
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Gagal mengubah password");
      }
      return await response.json();
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  },

  // Menghapus akun user
  deleteAccount: async () => {
    try {
      const token = getToken();
      if (!token) throw new Error("Token tidak ditemukan");
      const response = await fetch(`${API_BASE_URL}/users/account`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        credentials: "include"
      });
      if (response.status === 401) {
        localStorage.removeItem("token");
        throw new Error("Token tidak valid");
      }
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Gagal menghapus akun");
      }
      return await response.json();
    } catch (error) {
      console.error("Error deleting account:", error);
      throw error;
    }
  },

  // ===== ADMIN FUNCTIONS =====
  // Mendapatkan semua users (admin only)
  getAllUsers: async (page = 1, limit = 10, search = '', role = '', status = '') => {
    try {
      console.log('Calling getAllUsers with params:', { page, limit, search, role, status });
      const token = getToken();
      if (!token) {
        console.error('No token found when fetching users');
        throw new Error("Token tidak ditemukan");
      }
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(status && { status }),
        ...(role && { role })
      });
      
      const url = `${API_BASE_URL}/users/admin/all?${params}`;
      console.log('Fetching users from:', url);
      
      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        credentials: "include"
      });
      
      console.log('Response status:', response.status);
      
      if (response.status === 401) {
        console.error('Authentication error (401) when fetching users');
        localStorage.removeItem("token");
        throw new Error("Token tidak valid");
      }
      
      if (response.status === 403) {
        console.error('Authorization error (403) when fetching users');
        throw new Error("Akses ditolak. Anda tidak memiliki izin untuk melihat data pengguna.");
      }
      
      if (!response.ok) {
        console.error('Error response when fetching users:', response.status, response.statusText);
        
        // Try to get error message from response
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || "Gagal mengambil data pengguna";
          console.error('Error details:', errorData);
        } catch (e) {
          errorMessage = "Gagal mengambil data pengguna";
          console.error('Could not parse error response:', e);
        }
        
        throw new Error(errorMessage);
      }
      
      let data;
      try {
        data = await response.json();
        console.log('Users data received (raw):', data);
      } catch (e) {
        console.error('Error parsing JSON response:', e);
        throw new Error("Format respons tidak valid");
      }
      
      // Handle different response structures
      if (data && typeof data === 'object') {
        if (data.users && Array.isArray(data.users)) {
          console.log(`Found ${data.users.length} users in response`);
          // Return the complete object with users and pagination
          return data;
        } else if (Array.isArray(data)) {
          console.log(`Found ${data.length} users in array response`);
          // If API directly returns an array, wrap it with pagination info
          return { 
            users: data,
            pagination: {
              currentPage: page,
              totalPages: 1,
              totalUsers: data.length,
              hasNext: false,
              hasPrev: page > 1
            }
          };
        }
      }
      
      // If we couldn't extract users, return empty data structure
      console.error('Unexpected users data format:', data);
      return { 
        users: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalUsers: 0,
          hasNext: false,
          hasPrev: false
        }
      };
    } catch (error) {
      console.error("Error getting all users:", error);
      console.error("Error stack:", error.stack);
      // Return empty data structure instead of throwing to prevent UI errors
      return { 
        users: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalUsers: 0,
          hasNext: false,
          hasPrev: false
        }
      };
    }
  },

  // Mendapatkan detail user by ID (admin only)
  getUserById: async (userId) => {
    try {
      const token = getToken();
      if (!token) throw new Error("Token tidak ditemukan");
      
      const response = await fetch(`${API_BASE_URL}/users/admin/${userId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        },
        credentials: "include"
      });
      
      if (response.status === 401) {
        localStorage.removeItem("token");
        throw new Error("Token tidak valid");
      }
      if (response.status === 403) {
        throw new Error("Akses ditolak");
      }
      if (response.status === 404) {
        throw new Error("User tidak ditemukan");
      }
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Gagal mengambil data user");
      }
      return await response.json();
    } catch (error) {
      console.error("Error getting user by ID:", error);
      throw error;
    }
  },

  // Membuat user baru (admin only)
  createUser: async (userData) => {
    try {
      const token = getToken();
      if (!token) throw new Error("Token tidak ditemukan");
      
      const response = await fetch(`${API_BASE_URL}/users/admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: "include",
        body: JSON.stringify(userData)
      });
      
      if (response.status === 401) {
        localStorage.removeItem("token");
        throw new Error("Token tidak valid");
      }
      if (response.status === 403) {
        throw new Error("Akses ditolak");
      }
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Gagal membuat user baru");
      }
      return await response.json();
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  // Update user (admin only)
  updateUser: async (userId, userData) => {
    try {
      const token = getToken();
      if (!token) throw new Error("Token tidak ditemukan");
      
      const response = await fetch(`${API_BASE_URL}/users/admin/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: "include",
        body: JSON.stringify(userData)
      });
      
      if (response.status === 401) {
        localStorage.removeItem("token");
        throw new Error("Token tidak valid");
      }
      if (response.status === 403) {
        throw new Error("Akses ditolak");
      }
      if (response.status === 404) {
        throw new Error("User tidak ditemukan");
      }
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Gagal mengupdate user");
      }
      return await response.json();
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  // Delete user (admin only)
  deleteUser: async (userId) => {
    try {
      const token = getToken();
      if (!token) throw new Error("Token tidak ditemukan");
      
      const response = await fetch(`${API_BASE_URL}/users/admin/${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        credentials: "include"
      });
      
      if (response.status === 401) {
        localStorage.removeItem("token");
        throw new Error("Token tidak valid");
      }
      if (response.status === 403) {
        throw new Error("Akses ditolak");
      }
      if (response.status === 404) {
        throw new Error("User tidak ditemukan");
      }
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Gagal menghapus user");
      }
      return await response.json();
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },

  // Update status user (admin only)
  updateUserStatus: async (userId, status) => {
    try {
      const token = getToken();
      if (!token) throw new Error("Token tidak ditemukan");
      
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: "include",
        body: JSON.stringify({ status })
      });
      
      if (response.status === 401) {
        localStorage.removeItem("token");
        throw new Error("Token tidak valid");
      }
      if (response.status === 403) {
        throw new Error("Akses ditolak");
      }
      if (response.status === 404) {
        throw new Error("User tidak ditemukan");
      }
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Gagal mengupdate status user");
      }
      return await response.json();
    } catch (error) {
      console.error("Error updating user status:", error);
      throw error;
    }
  },

  // Export users data (admin only)
  exportUsers: async (format = 'excel') => {
    try {
      const token = getToken();
      if (!token) throw new Error("Token tidak ditemukan");
      
      const response = await fetch(`${API_BASE_URL}/admin/users/export?format=${format}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        },
        credentials: "include"
      });
      
      if (response.status === 401) {
        localStorage.removeItem("token");
        throw new Error("Token tidak valid");
      }
      if (response.status === 403) {
        throw new Error("Akses ditolak");
      }
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Gagal export data users");
      }
      
      // Return blob for file download
      return await response.blob();
    } catch (error) {
      console.error("Error exporting users:", error);
      throw error;
    }
  },

  // Get user statistics (admin only)
  getUserStats: async () => {
    try {
      console.log('Calling getUserStats');
      const token = getToken();
      if (!token) {
        console.error('No token found when fetching user stats');
        throw new Error("Token tidak ditemukan");
      }
      
      const url = `${API_BASE_URL}/users/admin/stats`;
      console.log('Fetching user stats from:', url);
      
      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        credentials: "include"
      });
      
      console.log('Stats response status:', response.status);
      
      if (response.status === 401) {
        console.error('Authentication error (401) when fetching stats');
        localStorage.removeItem("token");
        throw new Error("Token tidak valid");
      }
      
      if (response.status === 403) {
        console.error('Authorization error (403) when fetching stats');
        throw new Error("Akses ditolak. Anda tidak memiliki izin untuk melihat statistik pengguna.");
      }
      
      if (!response.ok) {
        console.error('Error response when fetching stats:', response.status, response.statusText);
        
        // Try to get error message from response
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || "Gagal mengambil statistik users";
          console.error('Error details:', errorData);
        } catch (e) {
          errorMessage = "Gagal mengambil statistik users";
          console.error('Could not parse error response:', e);
        }
        
        throw new Error(errorMessage);
      }
      
      let data;
      try {
        data = await response.json();
        console.log('Stats data received (raw):', data);
      } catch (e) {
        console.error('Error parsing JSON response for stats:', e);
        throw new Error("Format respons statistik tidak valid");
      }
      
      // Create a default stats object if response format is unexpected
      if (!data || typeof data !== 'object') {
        console.error('Unexpected stats data format:', data);
        return {
          totalUsers: 0,
          activeUsers: 0,
          inactiveUsers: 0,
          newUsersThisMonth: 0,
          adminCount: 0,
          memberCount: 0,
          suspendedUsers: 0
        };
      }
      
      return data;
    } catch (error) {
      console.error("Error getting user stats:", error);
      console.error("Error stack:", error.stack);
      // Return default stats object instead of throwing to prevent UI errors
      return {
        totalUsers: 0,
        activeUsers: 0, 
        inactiveUsers: 0,
        newUsersThisMonth: 0,
        adminCount: 0,
        memberCount: 0,
        suspendedUsers: 0
      };
    }
  },

  // Get user bookings (admin only)
  getUserBookings: async (userId, page = 1, limit = 10) => {
    try {
      const token = getToken();
      if (!token) throw new Error("Token tidak ditemukan");
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/bookings?${params}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        },
        credentials: "include"
      });
      
      if (response.status === 401) {
        localStorage.removeItem("token");
        throw new Error("Token tidak valid");
      }
      if (response.status === 403) {
        throw new Error("Akses ditolak");
      }
      if (response.status === 404) {
        throw new Error("User tidak ditemukan");
      }
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Gagal mengambil data booking user");
      }
      return await response.json();
    } catch (error) {
      console.error("Error getting user bookings:", error);
      throw error;
    }
  }
};

// Direct exports of individual functions for easier imports
export const getProfile = UserService.getProfile;
export const updateProfile = UserService.updateProfile;
export const changePassword = UserService.changePassword;
export const deleteAccount = UserService.deleteAccount;
export const getAllUsers = UserService.getAllUsers;
export const getUserById = UserService.getUserById;
export const createUser = UserService.createUser;
export const updateUser = UserService.updateUser;
export const deleteUser = UserService.deleteUser;
export const updateUserStatus = UserService.updateUserStatus;
export const exportUsers = UserService.exportUsers;
export const getUserStats = UserService.getUserStats;
export const getUserBookings = UserService.getUserBookings;

export default UserService;
