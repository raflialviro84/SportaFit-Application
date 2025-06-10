// src/pages/transaksi/ListTransaksi.jsx

import React, { useState, useEffect, useContext } from "react"; // Added useContext
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import BottomNavbar from "../main_menu/BottomNavbar";
import TransactionService from "../../services/transactionService";
import { API_BASE_URL } from "../../services/apiService"; // Import API_BASE_URL for EventSource
import { AuthContext } from "../../context/AuthContext"; // Import AuthContext

export default function ListTransaksi() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext); // Get user from AuthContext

  // Ambil data transaksi dari backend
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await TransactionService.getTransactions();
        console.log("Data received in ListTransaksi component:", JSON.stringify(data, null, 2)); // Log data here
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        if (error.message !== "User not authenticated") { // Avoid double alert if service already handles it
          alert("Gagal mengambil data transaksi. Silakan coba lagi.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) { // Only fetch if user is available
      fetchTransactions();
    }

  }, [user]); // Add user as a dependency

  // Setup Server-Sent Events (SSE)
  useEffect(() => {
    if (!user) return; // Don't establish SSE connection if no user

    const token = localStorage.getItem("token");
    if (!token) return; // Or handle appropriately

    // Construct the URL with the token as a query parameter for authentication
    // Note: SSE doesn't support custom headers directly in the EventSource constructor in browsers.
    // The backend's authMiddleware needs to be adapted to check for token in query params for this specific route if needed.
    // For simplicity, assuming authMiddleware on SSE route might allow connection and events are filtered client-side or backend sends user-specific events.
    const eventSource = new EventSource(`${API_BASE_URL}/events?token=${encodeURIComponent(token)}`);

    eventSource.onopen = () => {
      console.log("SSE connection established.");
    };

    eventSource.onmessage = (event) => {
      try {
        const eventData = JSON.parse(event.data);
        console.log("SSE event received:", eventData);

        if (eventData.type === 'BOOKING_UPDATED' || eventData.type === 'BOOKING_EXPIRED') {
          // Check if the update is relevant to the current user
          if (eventData.payload && eventData.payload.userId === user.id) {
            console.log(`Relevant booking update for user ${user.id}, refetching transactions...`);
            // Refetch transactions to get the latest list
            TransactionService.getTransactions()
              .then(setTransactions)
              .catch(err => {
                console.error("Error refetching transactions after SSE event:", err);
                // Optionally alert user or handle error
              });
          } else if (eventData.payload && eventData.payload.userId) {
            console.log(`SSE event for user ${eventData.payload.userId}, current user is ${user.id}. Ignoring.`);
          }
        }
      } catch (error) {
        console.error("Error parsing SSE event data:", error);
      }
    };

    eventSource.onerror = (error) => {
      // Coba akses status code jika ada (beberapa browser support)
      if (error && error.target && error.target.readyState === EventSource.CLOSED) {
        console.error("SSE connection closed by server.");
      }
      if (error && error.target && error.target.url) {
        console.error("EventSource failed for URL:", error.target.url);
      }
      // Log eventSource state
      if (eventSource.readyState === EventSource.CLOSED) {
        console.error("EventSource readyState: CLOSED");
      } else if (eventSource.readyState === EventSource.CONNECTING) {
        console.error("EventSource readyState: CONNECTING");
      } else if (eventSource.readyState === EventSource.OPEN) {
        console.error("EventSource readyState: OPEN");
      }
      // Log error object
      console.error("EventSource failed:", error);
      // Optional: tampilkan alert user jika error auth
      // alert("Koneksi real-time gagal. Silakan login ulang jika masalah berlanjut.");
    };

    // Cleanup on component unmount
    return () => {
      console.log("Closing SSE connection.");
      eventSource.close();
    };
  }, [user]); // Add user as a dependency to re-establish SSE if user changes

  // Fungsi untuk menampilkan status dengan warna yang sesuai
  const renderStatus = (status) => {
    let bgColor, textColor, displayText = status;

    // Ensure status is a string and convert to lowercase for case-insensitive comparison
    const lowerCaseStatus = typeof status === 'string' ? status.toLowerCase() : '';

    switch (lowerCaseStatus) {
      case "completed":
      case "confirmed":
      case "berhasil": // Existing case from original code
        bgColor = "bg-green-100";
        textColor = "text-green-800";
        displayText = "Berhasil";
        break;
      case "expired":
      case "kadaluarsa": // Existing case from original code
        bgColor = "bg-red-100";
        textColor = "text-red-800";
        displayText = "Kadaluarsa";
        break;
      case "pending":
        bgColor = "bg-yellow-100";
        textColor = "text-yellow-800";
        displayText = "Tertunda";
        break;
      case "cancelled":
      case "dibatalkan":
        bgColor = "bg-gray-100";
        textColor = "text-gray-800";
        displayText = "Dibatalkan";
        break;
      default:
        bgColor = "bg-blue-100"; // A neutral default for unknown or other statuses
        textColor = "text-blue-800";
        displayText = status || "Tidak Diketahui"; // Display the original status or "Tidak Diketahui"
    }

    return (
      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${bgColor} ${textColor}`}>
        {displayText}
      </span>
    );
  };

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
              Riwayat Transaksi
            </h1>
            <div className="w-6" />
          </div>
        </div>
        <div className="border-b border-gray-200" />
      </div>

      {/* Konten */}
      <div className="pt-24 max-w-[434px] mx-auto px-4 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>Tidak ada riwayat transaksi</p>
          </div>
        ) : (
          transactions.map((tx) => (
            <div
              key={tx.id}
              onClick={() => navigate(`/detail-transaksi/${tx.id}`)}
              className="bg-white rounded-2xl shadow px-4 py-4 flex justify-between items-start cursor-pointer border-l-4 border-sporta-blue hover:bg-gray-50"
            >
              {/* Detail */}
              <div className="space-y-1 flex-grow">
                <div className="text-xs text-gray-500 italic">
                  ID Transaksi: {tx.id}
                </div>
                <div className="text-sm font-semibold">
                  Tempat: {tx.description || "Deskripsi tempat tidak tersedia"}
                </div>
                <div className="text-xs text-gray-600">
                  Tgl. Booking: {tx.bookingDateFormatted || "Tanggal booking tidak tersedia"}
                </div>
                <div className="text-xs text-gray-600">
                  Waktu Booking: {tx.timeRange || "Waktu booking tidak tersedia"}
                </div>
                <div className="text-sm font-semibold text-gray-800 mt-1">
                  Total Bayar: Rp{typeof tx.amount === 'number' ? tx.amount.toLocaleString('id-ID') : '0'}
                </div>
                {tx.paymentMethod && (
                  <div className="text-xs text-gray-500 mt-1">
                    Metode Pembayaran: {tx.paymentMethod}
                  </div>
                )}
              </div>
              {/* Status */}
              <div className="ml-2 flex-shrink-0">
                {renderStatus(tx.status)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Navbar */}
      <BottomNavbar />
    </div>
  );
}
