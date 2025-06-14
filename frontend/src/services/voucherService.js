// src/services/voucherService.js

import { API_BASE_URL } from "../config/api";
import { getAuthToken } from "./authService";

/**
 * Service untuk mengelola voucher
 */
export default class VoucherService {
  /**
   * Mengambil semua voucher yang tersedia
   * @returns {Promise<Object>} Response dari API
   */
  static async getAllVouchers() {
    try {
      const token = getAuthToken() || localStorage.getItem('adminToken');
      // Pastikan endpoint sudah benar
      const url = `${API_BASE_URL}/vouchers`;
      console.log("Fetching vouchers from:", url);
      console.log("Token tersedia:", !!token);
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        // Tambahkan kredensial untuk mendukung cookie
        credentials: 'include'
      });
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `Server returned ${response.status}: ${response.statusText}`;
        } catch (jsonError) {
          errorMessage = `Server returned ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log("Vouchers fetched successfully:", data);
      return data;
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      
      // Cek apakah server berjalan
      try {
        const serverCheckResponse = await fetch(`${API_BASE_URL.split('/api')[0]}/health`, { 
          method: 'GET',
          mode: 'no-cors'
        });
        console.log("Server health check result:", serverCheckResponse.type);
      } catch (serverCheckError) {
        console.error("Server check failed:", serverCheckError);
        throw new Error("Koneksi gagal. Pastikan server berjalan di localhost:3000");
      }
      
      // Rethrow original error with better message
      if (error.message === "Failed to fetch") {
        throw new Error("Koneksi gagal. Pastikan server berjalan di localhost:3000");
      }
      throw error;
    }
  }

  /**
   * Mengambil semua voucher untuk admin dashboard
   * @returns {Promise<Object>} Response dari API
   */
  static async getAllVouchersAdmin(page = 1, limit = 10, search = '', status = 'all') {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error("Admin not authenticated");
      
      const url = `${API_BASE_URL}/vouchers/admin/all?page=${page}&limit=${limit}&search=${search}&status=${status}`;
      console.log("Fetching admin vouchers from:", url);
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `Server returned ${response.status}: ${response.statusText}`;
        } catch (jsonError) {
          errorMessage = `Server returned ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log("Admin vouchers fetched successfully:", data);
      return data;
    } catch (error) {
      console.error("Error fetching admin vouchers:", error);
      if (error.message === "Failed to fetch") {
        throw new Error("Koneksi gagal. Pastikan server berjalan di localhost:3000");
      }
      throw error;
    }
  }

  /**
   * Mengambil voucher berdasarkan ID
   * @param {number|string} id ID voucher
   * @returns {Promise<Object>} Response dari API
   */
  static async getVoucherById(id) {
    try {
      const token = getAuthToken();
      const url = `${API_BASE_URL}/vouchers/${id}`;
      console.log(`Fetching voucher with ID ${id} from:`, url);
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `Server returned ${response.status}: ${response.statusText}`;
        } catch (jsonError) {
          errorMessage = `Server returned ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log(`Voucher with ID ${id} fetched successfully:`, data);
      return data;
    } catch (error) {
      console.error(`Error fetching voucher with ID ${id}:`, error);
      if (error.message === "Failed to fetch") {
        throw new Error("Koneksi gagal. Pastikan server berjalan di localhost:3000");
      }
      throw error;
    }
  }

  /**
   * Mengambil semua voucher yang dimiliki user
   * @returns {Promise<Object>} Response dari API
   */
  static async getUserVouchers() {
    try {
      const token = getAuthToken();
      if (!token) {
        console.log("No auth token found, returning empty array");
        return { data: [] };
      }
      
      const url = `${API_BASE_URL}/vouchers/user/my-vouchers`;
      console.log("Fetching user vouchers from:", url);
      
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          credentials: 'include' // Add credentials support for cookies
        });
        
        if (!response.ok) {
          let errorMessage;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || `Server returned ${response.status}: ${response.statusText}`;
            console.error("Server error response for user vouchers:", errorData);
          } catch (jsonError) {
            errorMessage = `Server returned ${response.status}: ${response.statusText}`;
          }
          console.warn("Non-OK response when fetching vouchers:", errorMessage);
          return { data: [] }; // Return empty array instead of throwing
        }
        
        const data = await response.json();
        console.log("User vouchers fetched successfully:", data);
        
        // If data is empty or undefined, return an empty array
        if (!data || !data.data) {
          console.log("No vouchers found for user, returning empty array");
          return { data: [] };
        }
        
        return data;
      } catch (fetchError) {
        console.error("Fetch error in getUserVouchers:", fetchError);
        return { data: [] }; // Return empty array on fetch errors
      }
    } catch (error) {
      console.error("Unexpected error in getUserVouchers:", error);
      // Always return empty array instead of throwing to prevent app crashes
      return { data: [] };
    }
  }

  /**
   * Menambahkan voucher ke user
   * @param {string} voucherCode Kode voucher
   * @returns {Promise<Object>} Response dari API
   */
  static async addVoucherToUser(voucherCode) {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("User not authenticated");
      
      const url = `${API_BASE_URL}/vouchers/user/add`;
      console.log("Adding voucher with code:", voucherCode);
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ voucherCode }),
        credentials: 'include' // Tambahkan credentials untuk mendukung cookie
      });
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `Server returned ${response.status}: ${response.statusText}`;
          console.error("Server error response:", errorData);
        } catch (jsonError) {
          errorMessage = `Server returned ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log("Voucher added successfully:", data);
      return data;
    } catch (error) {
      console.error("Error adding voucher to user:", error);
      if (error.message === "Failed to fetch") {
        throw new Error("Koneksi gagal. Pastikan server berjalan di localhost:3000");
      }
      throw error;
    }
  }

  /**
   * Menggunakan voucher
   * @param {number|string} voucherId ID voucher
   * @returns {Promise<Object>} Response dari API
   */
  static async useVoucher(voucherId) {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("User not authenticated");
      
      const url = `${API_BASE_URL}/vouchers/user/use`;
      console.log("Using voucher with ID:", voucherId);
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ voucherId }),
        credentials: 'include' // Tambahkan credentials untuk mendukung cookie
      });
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `Server returned ${response.status}: ${response.statusText}`;
          console.error("Server error response:", errorData);
        } catch (jsonError) {
          errorMessage = `Server returned ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log("Voucher used successfully:", data);
      return data;
    } catch (error) {
      console.error("Error using voucher:", error);
      if (error.message === "Failed to fetch") {
        throw new Error("Koneksi gagal. Pastikan server berjalan di localhost:3000");
      }
      throw error;
    }
  }
}
