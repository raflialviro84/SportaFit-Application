import React, { useState, useEffect, useCallback } from "react";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import { useAuth } from "../../context/AuthContext";
import { useVoucher } from "../../context/voucher-context.js"; // Corrected import path

import { hasPin, savePin, verifyPin } from "../../services/pinService";
import PinModal from "../../components/PinModal";
import BookingService from "../../services/bookingService";

// Fallback data (should ideally not be used if location.state is always populated)
const fallbackBookingDetails = {
  arenaName: "Arena Tidak Diketahui",
  formattedDate: "Tanggal Tidak Diketahui",
  time: "Waktu Tidak Diketahui",
  courtName: "Lapangan Tidak Diketahui",
  price: 0,
  serviceFee: 0,
  discount: 0,
};

export default function KonfirmasiPembayaran() {
  const navigate = useNavigate();
  const location = useLocation();

  const [protection, setProtection] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [totalAmountFromDetail, setTotalAmountFromDetail] = useState(0); // Renamed for clarity
  const [bookingId, setBookingId] = useState(null);
  const [bookingDataForBackend, setBookingDataForBackend] = useState(null); // To store all booking related data for backend

  const [showPinModal, setShowPinModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pinError, setPinError] = useState("");
  const [pinAttempts, setPinAttempts] = useState(0);
  const [paymentError, setPaymentError] = useState(""); // Tambah state error

  const hargaProteksi = 2000; // Booking protection cost

  useEffect(() => {
    if (location.state) {
      const {
        bookingId: bId,
        selectedPaymentMethod,
        arenaName,
        formattedDate,
        time,
        courtName,
        price,
        serviceFee,
        discount, // This is appliedDiscountAmount from PaymentDetail
        finalTotalAmount: totalFromPrevPage, // This is finalTotalAmount from PaymentDetail
        appliedVoucher: voucherFromPrevPage, // This is the simplified voucher object with kode_voucher
        activity, 
        venueSubtitle
      } = location.state;

      setBookingId(bId);
      setPaymentMethod(selectedPaymentMethod);
      setSelectedVoucher(voucherFromPrevPage);

      const newBookingDetails = {
        arenaName: arenaName || fallbackBookingDetails.arenaName,
        formattedDate: formattedDate || fallbackBookingDetails.formattedDate,
        time: time || fallbackBookingDetails.time,
        courtName: courtName || fallbackBookingDetails.courtName,
        price: price != null ? price : fallbackBookingDetails.price,
        serviceFee: serviceFee != null ? serviceFee : fallbackBookingDetails.serviceFee,
        discount: discount != null ? discount : fallbackBookingDetails.discount,
        activity: activity,
        venueSubtitle: venueSubtitle
      };
      setBookingDetails(newBookingDetails);

      // totalAmountFromDetail is the total *before* protection fee is added on this page.
      // totalFromPrevPage is (price + serviceFee - discount) from PaymentDetail.
      setTotalAmountFromDetail(totalFromPrevPage != null ? totalFromPrevPage : 0);
      
      setBookingDataForBackend(location.state); 

    } else {
      console.warn("Data booking tidak ditemukan di location state. Menggunakan fallback atau redirect.");
      setBookingDetails(fallbackBookingDetails);
      setTotalAmountFromDetail(0);
      // navigate("/pemesanan"); // Consider redirecting if essential data is missing
    }
  }, [location.state]); // Removed navigate from deps as it's stable, added eslint-disable for safety if navigate was intended for other reasons

  const currentBookingDetails = bookingDetails || fallbackBookingDetails;

  // Ensure totalAmountFromDetail is a number before calculation
  const baseTotal = typeof totalAmountFromDetail === 'number' ? totalAmountFromDetail : 0;
  const finalTotalAmount = baseTotal + (protection ? hargaProteksi : 0);

  console.log('Data di Konfirmasi Pembayaran:', {
    bookingId,
    paymentMethod,
    selectedVoucher,
    bookingDetails: currentBookingDetails,
    totalAmountFromDetail, 
    protectionApplied: protection,
    hargaProteksi,
    finalTotalAmount, 
    bookingDataForBackend,
  });
  
  const handlePayButtonClick = async () => {
    console.log('[DEBUG] Tombol Bayar diklik. bookingId:', bookingDataForBackend?.bookingId, 'paymentMethod:', paymentMethod);

    if (!bookingDataForBackend?.bookingId || !paymentMethod) {
      setPaymentError("Booking ID atau metode pembayaran tidak ditemukan. Silakan coba lagi.");
      console.error("[ERROR] Missing bookingId or paymentMethod. bookingId:", bookingDataForBackend?.bookingId, "paymentMethod:", paymentMethod);
      return;
    }
    setPaymentError(''); // Clear previous errors

    try {
      const userHasPin = await hasPin(); // Use imported hasPin directly
      console.log('[DEBUG] User has PIN status:', userHasPin);

      if (userHasPin) {
        setShowPinModal(true);
      } else {
        navigate('/profile/create-pin', {
          state: {
            from: location.pathname,
            bookingData: bookingDataForBackend, // Contains bookingId, totalAmount, voucherId etc.
            paymentMethod: paymentMethod,     // Pass the selected payment method object
          }
        });
      }
    } catch (error) {
      console.error("Error checking PIN status:", error);
      // Display a more user-friendly error on the UI as well
      setPaymentError("Gagal memeriksa status PIN. Pastikan terkoneksi dengan internet dan coba lagi."); 
    }
  };

  const handlePinSubmit = async (pin, isNewPinCreation = false) => { 
    console.log('[DEBUG] handlePinSubmit dipanggil. PIN:', pin, 'isNewPinCreation:', isNewPinCreation);
    if (pin.length !== 6) {
      setPinError("PIN harus terdiri dari 6 digit");
      return;
    }
    setPinError("");
    setIsProcessing(true); 

    try {
      if (isNewPinCreation) {
        const success = await savePin(pin);
        if (success) {
          setPinAttempts(0);
          console.log('[DEBUG] PIN baru berhasil disimpan. Memanggil processPayment...');
          await processPayment(); 
        } else {
          setPinError("Gagal menyimpan PIN. Silakan coba lagi.");
          setIsProcessing(false); // Reset on failure
        }
      } else {
        const isPinValid = await verifyPin(pin);
        console.log('[DEBUG] Hasil verifyPin:', isPinValid, 'PIN yang dimasukkan:', pin);
        if (isPinValid) {
          setPinAttempts(0);
          console.log('[DEBUG] PIN valid. Memanggil processPayment...');
          await processPayment(); 
        } else {
          const nextAttempts = pinAttempts + 1;
          setPinAttempts(nextAttempts);
          setPinError('PIN salah.');
          if (nextAttempts >= 3) {
            setShowPinModal(false);
            setPinError(""); 
            alert("PIN salah 3x. Pemesanan dibatalkan.");
            // Batalkan pesanan di backend
            try {
              await BookingService.updateUserBookingStatus(bookingId, { status: 'cancelled_by_system' });
            } catch (err) {
              console.error('Gagal membatalkan pesanan secara otomatis:', err);
            }
            navigate("/pemesanan");
            setIsProcessing(false); // Reset on navigation
          } else {
            setPinError(`PIN salah. Sisa percobaan: ${3 - nextAttempts}`);
            setIsProcessing(false); // Reset on failed attempt
          }
        }
      }
    } catch (error) { 
      console.error("Error during PIN submission or payment processing:", error); 
      setPinError("Terjadi kesalahan. Silakan coba lagi.");
      setIsProcessing(false); // Crucial: Reset on any error in this block
    } 
  };

  const processPayment = async () => {
    console.log('[DEBUG] processPayment dipanggil');
    setPaymentError(""); // Reset error
    try {
      if (!bookingId) {
        setPaymentError("Booking ID tidak valid. Tidak dapat melanjutkan pembayaran.");
        alert("Booking ID tidak valid. Tidak dapat melanjutkan pembayaran.");
        throw new Error("Booking ID tidak ditemukan dari state");
      }
      if (!bookingDataForBackend) {
        setPaymentError("Data booking tidak lengkap. Tidak dapat melanjutkan pembayaran.");
        alert("Data booking tidak lengkap. Tidak dapat melanjutkan pembayaran.");
        throw new Error("Data booking lengkap tidak ditemukan.");
      }

      const paymentPayload = {
        status: "completed", 
        paymentMethod: paymentMethod?.name || bookingDataForBackend?.selectedPaymentMethod?.name || "Unknown",
        totalAmount: finalTotalAmount, 
        bookingProtection: protection,
        protectionCost: protection ? hargaProteksi : 0,
        originalPrice: currentBookingDetails.price,
        serviceFee: currentBookingDetails.serviceFee,
        discountApplied: currentBookingDetails.discount,
        voucherCode: selectedVoucher ? selectedVoucher.id : null, // FIX: always send voucher ID
      };

      console.log("[DEBUG] Akan memproses pembayaran dengan payload:", paymentPayload);
      // Tambahkan timeout agar tidak stuck loading
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout: Server tidak merespon dalam 10 detik.")), 10000)
      );
      const result = await Promise.race([
        BookingService.updateUserBookingStatus(bookingId, paymentPayload),
        timeoutPromise
      ]);
      console.log("[DEBUG] Sukses updateBookingStatus, result:", result);

      navigate("/pembayaran-sukses", { 
        state: { 
          bookingId: bookingId, 
          totalAmountPaid: finalTotalAmount, 
          paymentMethod: paymentMethod?.name 
        }
      });
    } catch (error) {
      console.error("Error processing payment:", error);
      setPaymentError(error.message || "Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.");
      alert(error.message || "Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.");
    } finally {
      setIsProcessing(false); 
      setShowPinModal(false); 
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-jakarta pb-24">
      {/* Header Fixed */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-white shadow">
        <div className="max-w-md mx-auto flex items-center h-16 px-4">
          <button onClick={() => navigate(-1)} className="p-2 text-gray-600">
            <IoArrowBack size={22} />
          </button>
          <h1 className="flex-1 text-center text-lg font-bold">
            Konfirmasi Pembayaran
          </h1>
          <div className="w-8" />
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-md mx-auto pt-20 px-4">
        {/* Rincian Pembayaran */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-4 pt-4 pb-3 text-base font-bold border-b border-gray-100">
            Rincian Pembayaran
          </div>

          {/* Detail Booking */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="font-semibold text-sm">{currentBookingDetails.arenaName}</div>
            <div className="text-xs text-gray-600 mt-1">
              {currentBookingDetails.formattedDate} | {currentBookingDetails.time}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {currentBookingDetails.courtName}
            </div>
          </div>

          {/* Proteksi/Asuransi */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <label htmlFor="protection" className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  id="protection" 
                  checked={protection} 
                  onChange={() => setProtection(!protection)} 
                  className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-3 text-sm font-semibold text-gray-700">Proteksi Batal Booking</span>
              </label>
              <span className="text-sm font-semibold text-blue-600">Rp {hargaProteksi.toLocaleString('id-ID')}</span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Kompensasi hingga 100% jika batal booking!
            </p>

            <div className="space-y-1 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Harga Lapangan</span>
                <span className="text-gray-800">Rp {currentBookingDetails.price?.toLocaleString('id-ID') || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Biaya Layanan</span>
                <span className="text-gray-800">Rp {currentBookingDetails.serviceFee?.toLocaleString('id-ID') || '0'}</span>
              </div>
              {selectedVoucher && currentBookingDetails.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="text-gray-600">Diskon Voucher ({selectedVoucher.title || selectedVoucher.kode_voucher || 'Voucher'})</span>
                  <span className="font-medium">- Rp {currentBookingDetails.discount?.toLocaleString('id-ID') || '0'}</span>
                </div>
              )}
              {protection && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Proteksi Batal Booking</span>
                  <span className="text-gray-800">Rp {hargaProteksi.toLocaleString('id-ID')}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="text-base font-bold">Total Harga</span>
              <span className="text-xl font-bold text-blue-600">Rp {finalTotalAmount.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          Dengan membeli, kamu setuju dengan{' '}
          <a href="/syarat-ketentuan" className="text-blue-600 hover:underline">
            Syarat & Ketentuan
          </a>{' '}kami.
        </div>
      </div>

      {/* Footer Fixed - Tombol Bayar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-top p-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => {
              console.log('[DEBUG] Tombol Bayar diklik. bookingId:', bookingId, 'paymentMethod:', paymentMethod);
              if (!bookingId) {
                setPaymentError('Booking ID belum siap. Silakan refresh halaman.');
                return;
              }
              if (!paymentMethod) {
                setPaymentError('Metode pembayaran belum dipilih.');
                return;
              }
              handlePayButtonClick();
            }}
            disabled={isProcessing || !bookingId || !paymentMethod}
            className={`w-full h-12 px-6 text-white font-semibold rounded-lg transition-colors
                        ${isProcessing || !bookingId || !paymentMethod ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </div>
            ) : `Bayar Rp ${finalTotalAmount.toLocaleString('id-ID')}`}
          </button>
        </div>
      </div>

      {showPinModal && console.log('[DEBUG] PinModal dirender, showPinModal:', showPinModal)}
      {showPinModal && (
        <PinModal
          isOpen={showPinModal} // Ditambahkan: showPinModal diteruskan sebagai prop isOpen
          onClose={() => {
            console.log("[DEBUG] PinModal onClose called");
            setShowPinModal(false);
            setPinError(''); // Reset PIN error when closing modal
          }}
          onSubmit={handlePinSubmit}
          title="Masukkan PIN Keamanan Anda"
          isProcessing={isProcessing}
          externalError={pinError}
        />
      )}

      {/* Tambahkan di dalam return sebelum footer button */}
      {paymentError && (
        <div className="bg-red-100 text-red-700 px-4 py-2 text-center font-semibold mb-2 rounded">
          {paymentError}
        </div>
      )}
    </div>
  );
}
