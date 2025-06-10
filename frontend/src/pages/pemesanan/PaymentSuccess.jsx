// src/pages/pemesanan/PaymentSuccess.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import BookingService from "../../services/bookingService";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentData, setPaymentData] = useState(null);

  // Ambil data pembayaran dari backend atau gunakan fallback
  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const bookingId = location.state?.bookingId;
        if (!bookingId) throw new Error("Booking ID tidak ditemukan");

        const data = await BookingService.getBookingById(bookingId);
        setPaymentData(data);
      } catch (error) {
        console.error("Error fetching payment data:", error);
        alert("Gagal mengambil data pembayaran. Silakan coba lagi.");
        navigate("/pemesanan");
      }
    };

    fetchPaymentData();
  }, [location.state, navigate]);

  // Gunakan data pembayaran dari backend atau fallback
  const payment = paymentData || fallbackPayment;

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const formatPaymentDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return `${date.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'][date.getMonth()]} ${date.getFullYear()}, ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleBackToTransactions = () => {
    navigate("/transaksi");
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4 py-6 font-jakarta">
      <div className="w-full max-w-[434px] bg-white rounded-3xl shadow-md overflow-hidden flex flex-col items-center p-6">

        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-sporta-blue flex items-center justify-center mb-4">
          <IoCheckmarkCircleOutline
            size={40}
            className="text-white"
          />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Pembayaran Berhasil!
        </h2>
        <p className="text-center text-gray-600 mb-6 px-4">
          Terima kasih! Pembayaran Anda telah diterima.
          Transaksi Anda akan segera diproses.
        </p>

        {/* Ringkasan Pembayaran */}
        <div className="w-full bg-gray-100 rounded-xl p-4 mb-6">
          <div className="flex justify-between text-sm py-2 border-b border-gray-200">
            <span className="font-medium text-gray-700">ID Transaksi</span>
            <span className="font-medium text-gray-900">{payment.id || '-'}</span>
          </div>
          <div className="flex justify-between text-sm py-2 border-b border-gray-200">
            <span className="font-medium text-gray-700">Jumlah Pembayaran</span>
            <span className="font-medium text-gray-900">Rp{(payment.finalTotalAmount || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm py-2 border-b border-gray-200">
            <span className="font-medium text-gray-700">Tanggal</span>
            <span className="font-medium text-gray-900">{payment.formattedDate || '-'}</span>
          </div>
          <div className="flex justify-between text-sm py-2 border-b border-gray-200">
            <span className="font-medium text-gray-700">Arena</span>
            <span className="font-medium text-gray-900">{payment.arenaName}</span>
          </div>
          <div className="flex justify-between text-sm py-2 border-b border-gray-200">
            <span className="font-medium text-gray-700">Lapangan</span>
            <span className="font-medium text-gray-900">{payment.courtName || '-'}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={handleBackToTransactions}
            className="w-full py-3 bg-sporta-blue text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Lihat Transaksi
          </button>
          <button
            onClick={handleBackToHome}
            className="w-full py-3 border border-sporta-blue text-sporta-blue font-semibold rounded-lg hover:bg-sporta-blue hover:text-white transition"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
}

// Fallback data jika tidak ada data pembayaran
const fallbackPayment = {
  id: "INV-00000001", // invoice_number
  arenaName: "Zuper Badminton Keputih",
  location: "Zuper Badminton Keputih, Surabaya",
  formattedDate: "Sabtu, 19 April 2025", // tanggal booking
  time: "19:00 - 22:00",
  finalTotalAmount: 245000, // total bayar
  courtName: "Lapangan 1"
};
