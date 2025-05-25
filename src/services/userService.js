// src/services/userService.js

import { API_BASE_URL } from "./apiService";

export const UserService = {
  // Mendapatkan profil user
  getProfile: async () => {
    try {
      const token = localStorage.getItem("token");
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
      const token = localStorage.getItem("token");
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
      const token = localStorage.getItem("token");
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
      const token = localStorage.getItem("token");
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
  }
};

export default UserService;
