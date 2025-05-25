// src/pages/pemesanan/ListPemesanan.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import BottomNavbar from "../main_menu/BottomNavbar";
import { getRemainingTime, formatTime } from "../../services/bookingHistoryService";
import BookingService from "../../services/bookingService"; // Changed import
import SSEClient from "../../services/sseService";
import BookingCard from "../../components/BookingCard";

// Tidak ada lagi fallback data, hanya menampilkan pemesanan user

export default function ListPemesanan() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remainingTimes, setRemainingTimes] = useState({});

  // Fetch data booking dari backend
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        // TODO: Get actual userId, for now, assuming it's handled by the backend or a placeholder
        const data = await BookingService.getUserBookings("currentUser"); // Changed to use BookingService
        setBookings(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        alert("Gagal mengambil data pemesanan. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Hitung sisa waktu untuk setiap booking
  useEffect(() => {
    if (!Array.isArray(bookings) || bookings.length === 0) return;
    // Inisialisasi sisa waktu
    const times = {};
    bookings.forEach(booking => {
      if (booking.status === "Menunggu" && booking.expiryTime) {
        times[booking.id] = getRemainingTime(booking.expiryTime);
      }
    });
    setRemainingTimes(times);

    // Update sisa waktu setiap detik
    const timer = setInterval(() => {
      setRemainingTimes(prevTimes => {
        const newTimes = { ...prevTimes };
        Object.keys(newTimes).forEach(id => {
          if (newTimes[id] > 0) {
            newTimes[id] -= 1;
          }
        });
        return newTimes;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [bookings]);

  // Handler hapus booking kadaluarsa secara lokal (tidak panggil API)
  useEffect(() => {
    if (!Array.isArray(bookings) || bookings.length === 0) return;
    const expiredIds = Object.keys(remainingTimes).filter(id => remainingTimes[id] <= 0);
    if (expiredIds.length > 0) {
      setBookings(prev => prev.filter(b => !expiredIds.includes(String(b.id))));
    }
  }, [remainingTimes, bookings]);

  // SSE real-time update
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const sse = new SSEClient(token);
    const unsub = sse.subscribe((event) => {
      if (event.type === "BOOKING_UPDATED" || event.type === "BOOKING_EXPIRED") {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === event.payload.invoiceNumber || b.id === event.payload.id
              ? { ...b, status: event.payload.status, paymentStatus: event.payload.paymentStatus }
              : b
          )
        );
      }
    });
    return () => {
      unsub();
      sse.close();
    };
  }, []);

  // Helper to render status badge with consistent colors
  const renderStatus = (status) => {
    let bgColor, textColor, displayText = status;
    const lower = typeof status === 'string' ? status.toLowerCase() : '';
    switch (lower) {
      case 'menunggu': case 'pending':
        bgColor = 'bg-yellow-100'; textColor = 'text-yellow-800'; displayText = 'Tertunda'; break;
      case 'berhasil': case 'confirmed': case 'completed':
        bgColor = 'bg-green-100'; textColor = 'text-green-800'; displayText = 'Berhasil'; break;
      case 'kadaluarsa': case 'expired':
        bgColor = 'bg-red-100'; textColor = 'text-red-800'; displayText = 'Kadaluarsa'; break;
      case 'dibatalkan': case 'cancelled':
        bgColor = 'bg-gray-100'; textColor = 'text-gray-800'; displayText = 'Dibatalkan'; break;
      default:
        bgColor = 'bg-blue-100'; textColor = 'text-blue-800'; displayText = status || 'Tidak Diketahui';
    }
    return (
      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${bgColor} ${textColor}`}>{displayText}</span>
    );
  };

  // Error boundary sederhana
  let content = null;
  try {
    content = (
      <div className="pt-24 max-w-[434px] mx-auto px-4 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : Array.isArray(bookings) && bookings.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>Tidak ada pemesanan yang menunggu pembayaran</p>
          </div>
        ) : (
          Array.isArray(bookings) ? bookings.map((bk, index) => (
            <BookingCard key={bk.invoice_number || bk.id || index} booking={bk} />
          )) : null
        )}
      </div>
    );
  } catch {
    content = <div className="text-center text-red-500 py-10">Terjadi kesalahan pada tampilan pemesanan.</div>;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24 font-jakarta">
      {/* Header fixed */}
      <div className="fixed top-0 left-0 right-0 bg-[#F9FAFB] z-20">
        <div className="max-w-[434px] mx-auto px-4 pt-6 pb-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-600"
            >
              <IoArrowBack size={24} />
            </button>
            <h1 className="flex-1 text-center text-xl font-bold">
              Riwayat Pemesanan
            </h1>
            <div className="w-6" />
          </div>
        </div>
        <div className="border-b border-gray-200" />
      </div>
      {content}
      {/* Bottom Navbar */}
      <BottomNavbar />
    </div>
  );
}
