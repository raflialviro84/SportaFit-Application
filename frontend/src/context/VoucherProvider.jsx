import React, { useState, useEffect } from "react";
import { VoucherContext } from "./voucher-context.js";
import { useAuth } from "./AuthContext";
import VoucherService from "../services/voucherService";

// Provider component
export function VoucherProvider({ children }) {
  const [vouchers, setVouchers] = useState([]);
  const [userVouchers, setUserVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  // Deteksi apakah pengguna adalah admin
  useEffect(() => {
    // Cek apakah ada token admin di localStorage
    const adminToken = localStorage.getItem('adminToken');
    setIsAdmin(!!adminToken);
    
    console.log("Admin mode:", !!adminToken);
  }, []);

  // Fetch vouchers & user vouchers when user changes or on mount
  useEffect(() => {
    const fetchVouchers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching vouchers in ${isAdmin ? 'admin' : 'user'} mode...`);
        
        // Jika admin, gunakan endpoint admin
        let allVouchersRes;
        if (isAdmin) {
          try {
            allVouchersRes = await VoucherService.getAllVouchersAdmin();
            console.log("Admin vouchers response:", allVouchersRes);
            
            // Handle different response formats for admin
            const vouchersData = allVouchersRes.data?.vouchers || allVouchersRes.data || [];
            setVouchers(Array.isArray(vouchersData) ? vouchersData : []);
          } catch (adminErr) {
            console.error("Error fetching admin vouchers:", adminErr);
            // Fallback to regular endpoint if admin endpoint fails
            allVouchersRes = await VoucherService.getAllVouchers();
            console.log("Fallback to regular vouchers:", allVouchersRes);
            
            const vouchersData = allVouchersRes.data || allVouchersRes || [];
            setVouchers(Array.isArray(vouchersData) ? vouchersData : []);
          }
        } else {
          // Normal user flow
          allVouchersRes = await VoucherService.getAllVouchers();
          console.log("Regular vouchers response:", allVouchersRes);
          
          const vouchersData = allVouchersRes.data || allVouchersRes || [];
          setVouchers(Array.isArray(vouchersData) ? vouchersData : []);
        }
        
        // Fetch user vouchers if user is logged in (not admin)
        if (user && !isAdmin) {
          console.log("Fetching user vouchers for user:", user.id);
          try {
            const userVouchersRes = await VoucherService.getUserVouchers();
            console.log("User vouchers response:", userVouchersRes);
            
            // Handle different response formats with better debugging
            if (userVouchersRes && userVouchersRes.data) {
              console.log("Voucher data found in response:", userVouchersRes.data);
              setUserVouchers(Array.isArray(userVouchersRes.data) ? userVouchersRes.data : []);
            } else {
              console.log("No valid data in userVouchersRes:", userVouchersRes);
              setUserVouchers([]);
            }
          } catch (userVoucherErr) {
            console.error("Error fetching user vouchers:", userVoucherErr);
            // Don't fail completely if only user vouchers fail, just set empty array
            setUserVouchers([]);
          }
        } else {
          setUserVouchers([]);
        }
      } catch (err) {
        console.error('[VoucherProvider] Error fetching vouchers:', err);
        setError(err.message || "Gagal mengambil data voucher");
        // Set empty arrays to prevent null/undefined errors
        setVouchers([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVouchers();
  }, [user, isAdmin]);

  // Optionally, expose a refresh function
  const refreshVouchers = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Refreshing all vouchers...");
      const allVouchersRes = await VoucherService.getAllVouchers();
      console.log("Refreshed vouchers response:", allVouchersRes);
      
      // Handle different response formats
      const vouchersData = allVouchersRes.data || allVouchersRes || [];
      setVouchers(Array.isArray(vouchersData) ? vouchersData : []);
      
      if (user) {
        console.log("Refreshing user vouchers...");
        try {
          const userVouchersRes = await VoucherService.getUserVouchers();
          console.log("Refreshed user vouchers response:", userVouchersRes);
          
          // Handle different response formats with better debugging
          if (userVouchersRes && userVouchersRes.data) {
            console.log("User voucher data found in refresh:", userVouchersRes.data);
            setUserVouchers(Array.isArray(userVouchersRes.data) ? userVouchersRes.data : []);
          } else {
            console.log("No valid data in refreshed userVouchersRes:", userVouchersRes);
            // Keep previous vouchers if the new data is invalid
            if (userVouchers.length > 0) {
              console.log("Keeping previous user vouchers due to invalid refresh data");
            } else {
              setUserVouchers([]);
            }
          }
        } catch (userVoucherErr) {
          console.error("Error refreshing user vouchers:", userVoucherErr);
          // Don't fail completely if only user vouchers fail
          // Keep previous user vouchers if there was an error
          console.log("Keeping previous user vouchers due to refresh error");
        }
      } else {
        setUserVouchers([]);
      }
    } catch (err) {
      console.error('[VoucherProvider] Error refreshing vouchers:', err);
      setError(err.message || "Gagal memperbarui data voucher");
      // Keep previous data on refresh error instead of setting empty arrays
      console.log("Keeping previous voucher data due to refresh error");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk klaim voucher
  const addVoucherToUser = async (voucherCode) => {
    try {
      console.log(`Claiming voucher with code: ${voucherCode}`);
      const result = await VoucherService.addVoucherToUser(voucherCode);
      console.log("Voucher claim result:", result);
      
      // Refresh voucher user setelah klaim
      await refreshVouchers();
      
      return result;
    } catch (err) {
      console.error("Error in addVoucherToUser:", err);
      throw err;
    }
  };

  // Fungsi untuk mengambil detail voucher by ID
  const getVoucherById = async (id) => {
    try {
      console.log(`Getting voucher details for ID: ${id}`);
      const result = await VoucherService.getVoucherById(id);
      console.log("Voucher details result:", result);
      return result.data || result;
    } catch (err) {
      console.error(`Error getting voucher with ID ${id}:`, err);
      throw err;
    }
  };

  // Fungsi untuk menggunakan voucher
  const useVoucher = async (voucherId) => {
    try {
      console.log(`Using voucher with ID: ${voucherId}`);
      const result = await VoucherService.useVoucher(voucherId);
      console.log("Voucher usage result:", result);
      
      // Refresh voucher user setelah menggunakan voucher
      await refreshVouchers();
      
      return result;
    } catch (err) {
      console.error("Error in useVoucher:", err);
      throw err;
    }
  };
  
  // Fungsi untuk menghitung diskon voucher
  const calculateVoucherDiscount = (voucher, totalAmount) => {
    if (!voucher) return 0;
    
    // Cek minimal pembelian
    if (totalAmount < (voucher.minPurchase || 0)) {
      console.log(`Total amount ${totalAmount} is less than minimum purchase ${voucher.minPurchase}`);
      return 0;
    }
    
    let discount = 0;
    
    // Hitung diskon berdasarkan tipe
    if (voucher.discountType === 'percentage') {
      discount = (totalAmount * voucher.discountValue) / 100;
      
      // Terapkan maksimal diskon jika ada
      if (voucher.maxDiscount && discount > voucher.maxDiscount) {
        discount = voucher.maxDiscount;
      }
    } else if (voucher.discountType === 'fixed') {
      discount = voucher.discountValue;
    }
    
    console.log(`Calculated discount: ${discount} for voucher ${voucher.title}`);
    return discount;
  };

  const value = {
    vouchers,
    userVouchers,
    loading,
    error,
    refreshVouchers,
    addVoucherToUser,
    getVoucherById,
    useVoucher,
    calculateVoucherDiscount
  };

  return (
    <VoucherContext.Provider value={value}>
      {children}
    </VoucherContext.Provider>
  );
}
