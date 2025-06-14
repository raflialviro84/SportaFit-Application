import React, { useState, useEffect } from 'react';
import { useVoucher } from '../context/voucher-context';

/**
 * Komponen pemilih voucher untuk halaman checkout/pembayaran
 * @param {Object} props - Component properties
 * @param {number} props.subtotal - Total harga sebelum diskon
 * @param {Function} props.onVoucherSelected - Callback saat voucher dipilih
 * @param {Function} props.onVoucherRemoved - Callback saat voucher dihapus
 */
const VoucherSelector = ({ subtotal = 0, onVoucherSelected, onVoucherRemoved }) => {
  const { userVouchers, loading, error, refreshVouchers, calculateVoucherDiscount } = useVoucher();
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState(null);
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [showVoucherList, setShowVoucherList] = useState(false);

  // Muat voucher saat komponen dimount
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        console.log("Fetching vouchers for selector component");
        await refreshVouchers();
      } catch (err) {
        console.error("Error refreshing vouchers:", err);
        setVoucherError("Gagal memuat voucher");
      }
    };

    fetchVouchers();
  }, [refreshVouchers]);

  // Filter voucher yang tersedia (belum digunakan)
  useEffect(() => {
    console.log("User vouchers in selector:", userVouchers);
    // Fix for when userVouchers might be undefined, null, or not an array
    const vouchersArray = Array.isArray(userVouchers) ? userVouchers : [];
    
    // Add direct logging to see what's available
    if (vouchersArray.length > 0) {
      console.log(`Found ${vouchersArray.length} user vouchers, filtering usable ones...`);
      
      // Filter voucher yang belum digunakan
      const filtered = vouchersArray.filter(voucher => {
        const isUsable = voucher && !voucher.isUsed;
        if (!isUsable) {
          console.log("Skipping voucher because it's used or invalid:", voucher);
        }
        return isUsable;
      });
      
      console.log("Available vouchers after filtering:", filtered);
      setAvailableVouchers(filtered);
    } else {
      console.log("No user vouchers available or userVouchers is not an array", userVouchers);
      setAvailableVouchers([]);
    }
  }, [userVouchers]);

  // Handler saat voucher dipilih
  const handleSelectVoucher = (voucher) => {
    setVoucherError(null);
    
    // Cek minimal pembelian
    if (subtotal < (voucher.minPurchase || 0)) {
      setVoucherError(`Minimal pembelian Rp ${(voucher.minPurchase || 0).toLocaleString('id-ID')} untuk menggunakan voucher ini`);
      return;
    }
    
    // Hitung diskon
    const discount = calculateVoucherDiscount(voucher, subtotal);
    
    // Set voucher terpilih
    setSelectedVoucher(voucher);
    setShowVoucherList(false);
    
    // Panggil callback dengan data voucher dan diskon
    if (onVoucherSelected) {
      onVoucherSelected(voucher, discount);
    }
  };

  // Handler saat voucher dihapus
  const handleRemoveVoucher = () => {
    setSelectedVoucher(null);
    setVoucherError(null);
    
    // Panggil callback
    if (onVoucherRemoved) {
      onVoucherRemoved();
    }
  };

  // Lihat voucher di halaman voucher
  const handleViewVouchers = () => {
    window.location.href = '/vouchers';
  };

  return (
    <div className="border rounded-lg p-4 mb-4">
      <h3 className="text-md font-semibold mb-3">Voucher Diskon</h3>
      
      {/* Error Message */}
      {voucherError && (
        <div className="mb-3 p-2 bg-red-50 text-red-600 text-sm rounded">
          {voucherError}
        </div>
      )}

      {/* Selected Voucher */}
      {selectedVoucher ? (
        <div className="mb-3 p-3 border border-blue-200 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{selectedVoucher.title}</p>
              <p className="text-xs text-gray-600">
                {selectedVoucher.discountType === 'percentage'
                  ? `Diskon ${selectedVoucher.discountValue}%`
                  : `Diskon Rp ${selectedVoucher.discountValue.toLocaleString('id-ID')}`}
              </p>
            </div>
            <button
              onClick={handleRemoveVoucher}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Hapus
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Voucher Selector Button */}
          <button
            onClick={() => setShowVoucherList(!showVoucherList)}
            className="w-full py-2 px-3 border border-gray-300 rounded-lg flex justify-between items-center"
          >
            <span className="text-gray-500">
              {loading ? "Memuat voucher..." : "Pilih voucher"}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 text-gray-400 transition-transform ${
                showVoucherList ? "transform rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          
          {/* Voucher List */}
          {showVoucherList && (
            <div className="mt-2 border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Memuat voucher...</p>
                </div>
              ) : availableVouchers.length === 0 ? (
                <div className="p-4 text-center">
                  <div className="text-sm text-gray-500 mb-3">
                    Anda belum memiliki voucher yang dapat digunakan.
                  </div>
                  <button
                    onClick={handleViewVouchers}
                    className="text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-md"
                  >
                    Lihat Voucher
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {availableVouchers.map((voucher) => (
                    <div
                      key={voucher.id}
                      onClick={() => handleSelectVoucher(voucher)}
                      className="p-3 hover:bg-gray-50 cursor-pointer"
                    >
                      <p className="font-medium">{voucher.title}</p>
                      <p className="text-xs text-gray-600">
                        {voucher.discountType === 'percentage'
                          ? `Diskon ${voucher.discountValue}%`
                          : `Diskon Rp ${voucher.discountValue.toLocaleString('id-ID')}`}
                      </p>
                      {voucher.minPurchase > 0 && (
                        <p className="text-xs text-gray-500">
                          Min. pembelian Rp {voucher.minPurchase.toLocaleString('id-ID')}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Berlaku hingga: {voucher.validUntil}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VoucherSelector;