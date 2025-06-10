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
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/vouchers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to fetch vouchers");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching vouchers:", error);
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
      const response = await fetch(`${API_BASE_URL}/vouchers/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to fetch voucher");
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching voucher with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Mengambil voucher yang dimiliki user
   * @returns {Promise<Object>} Response dari API
   */
  static async getUserVouchers() {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("User not authenticated");
      const response = await fetch(`${API_BASE_URL}/vouchers/user/my-vouchers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to fetch user vouchers");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching user vouchers:", error);
      throw error;
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
      const response = await fetch(`${API_BASE_URL}/vouchers/user/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ voucherCode })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to add voucher");
      }
      return await response.json();
    } catch (error) {
      console.error("Error adding voucher to user:", error);
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
      const response = await fetch(`${API_BASE_URL}/vouchers/user/use`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ voucherId })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to use voucher");
      }
      return await response.json();
    } catch (error) {
      console.error("Error using voucher:", error);
      throw error;
    }
  }
}
