import React, { useState, useEffect } from "react";
import { VoucherContext } from "./voucher-context";
import { useAuth } from "./auth-context";
import VoucherService from "../services/voucherService";

// Provider component
export function VoucherProvider({ children }) {
  const [vouchers, setVouchers] = useState([]);
  const [userVouchers, setUserVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Fetch vouchers & user vouchers when user changes or on mount
  useEffect(() => {
    const fetchVouchers = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all vouchers
        const allVouchersRes = await VoucherService.getAllVouchers();
        setVouchers(allVouchersRes.data || []);
        // Fetch user vouchers if user is logged in
        if (user) {
          const userVouchersRes = await VoucherService.getUserVouchers();
          setUserVouchers(userVouchersRes.data || []);
        } else {
          setUserVouchers([]);
        }
      } catch (err) {
        setError(err.message || "Gagal mengambil data voucher");
      } finally {
        setLoading(false);
      }
    };
    fetchVouchers();
  }, [user]);

  // Optionally, expose a refresh function
  const refreshVouchers = async () => {
    setLoading(true);
    setError(null);
    try {
      const allVouchersRes = await VoucherService.getAllVouchers();
      setVouchers(allVouchersRes.data || []);
      if (user) {
        const userVouchersRes = await VoucherService.getUserVouchers();
        setUserVouchers(userVouchersRes.data || []);
      } else {
        setUserVouchers([]);
      }
    } catch (err) {
      setError(err.message || "Gagal mengambil data voucher");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk klaim voucher
  const addVoucherToUser = async (voucherCode) => {
    try {
      const result = await VoucherService.addVoucherToUser(voucherCode);
      // Refresh voucher user setelah klaim
      if (user) {
        const userVouchersRes = await VoucherService.getUserVouchers();
        setUserVouchers(userVouchersRes.data || []);
      }
      return result;
    } catch (err) {
      throw err;
    }
  };

  // Fungsi untuk mengambil detail voucher by ID
  const getVoucherById = async (id) => {
    const result = await VoucherService.getVoucherById(id);
    return result.data;
  };

  const value = {
    vouchers,
    userVouchers,
    loading,
    error,
    refreshVouchers,
    addVoucherToUser,
    getVoucherById, // <-- tambahkan ini
    // ...tambahkan fungsi context lain jika perlu...
  };

  return (
    <VoucherContext.Provider value={value}>
      {children}
    </VoucherContext.Provider>
  );
}
