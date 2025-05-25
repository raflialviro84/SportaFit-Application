// src/pages/transaksi/Transactions.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import BottomNavbar from "../main_menu/BottomNavbar";
import TransactionService from "../../services/transactionService"; // Changed import

// Tidak ada lagi fallback data, hanya menampilkan transaksi user

export default function Transactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchTransactions() {
      setLoading(true);
      try {
        const allTransactions = await TransactionService.getTransactions(); // Changed to use TransactionService
        if (isMounted) {
          setTransactions(Array.isArray(allTransactions) ? allTransactions : []);
        }
      } catch (error) {
        console.error('Error loading transactions:', error);
        if (isMounted) setTransactions([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchTransactions();
    return () => { isMounted = false; };
  }, []);

  // Error boundary sederhana
  let content = null;
  try {
    content = (
      <div className="pt-24 w-full max-w-[434px] mx-auto px-2 sm:px-4 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : Array.isArray(transactions) && transactions.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>Tidak ada riwayat transaksi</p>
          </div>
        ) : (
          Array.isArray(transactions) ? transactions.map((tx) => {
            const isSuccess = tx.status === "completed" || tx.status === "confirmed";
            return (
              <div
                key={tx.id}
                onClick={() => navigate(isSuccess ? `/transaksi/success/${tx.id}` : `/transaksi/failed/${tx.id}`)}
                className={`
                  bg-white rounded-2xl shadow-lg px-4 sm:px-8 py-5 mb-8 flex flex-col gap-2 border-l-4 transition hover:shadow-xl hover:-translate-y-1 duration-150 w-full max-w-2xl mx-auto
                  ${isSuccess ? "border-green-400" : "border-red-400"}
                `}
                style={{ minWidth: 0 }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="text-xs text-black italic max-w-full break-words">
                    <div>ID Transaksi:</div>
                    <div className="font-semibold break-words whitespace-normal">{tx.id}</div>
                  </div>
                  <span
                    className={`text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap shadow-sm ${isSuccess ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                    style={{textTransform: 'uppercase'}}
                  >
                    {isSuccess ? 'BERHASIL' : 'GAGAL'}
                  </span>
                </div>
                <div className="flex flex-col gap-1 mt-1">
                  <div className="font-normal text-sm text-black truncate">
                    <span className="font-semibold">Tempat:</span> {tx.placeName || (tx.description ? tx.description.split(' - ')[0].replace(/^Booking di /i, '') : "-")}
                  </div>
                  <div className="font-normal text-sm text-black truncate">
                    <span className="font-semibold">Lapangan:</span> {tx.courtName || tx.fieldName || tx.lapangan || (tx.description && tx.description.split(' - ')[1]) || tx.court || "-"}
                  </div>
                  <div className="font-normal text-sm text-black truncate">
                    <span className="font-semibold">Tgl. Booking:</span> {tx.bookingDateFormatted || "-"}
                  </div>
                  <div className="font-normal text-sm text-black truncate">
                    <span className="font-semibold">Waktu:</span> {tx.timeRange || "-"}
                  </div>
                  <div className="font-normal text-sm text-black truncate">
                    <span className="font-semibold">Total Bayar:</span> Rp{typeof tx.amount === 'number' ? tx.amount.toLocaleString('id-ID') : '0'}
                  </div>
                  {tx.paymentMethod && (
                    <div className="font-normal text-sm text-black truncate">
                      <span className="font-semibold">Metode Pembayaran:</span> {tx.paymentMethod}
                    </div>
                  )}
                </div>
              </div>
            );
          }) : null
        )}
      </div>
    );
  } catch {
    content = <div className="text-center text-red-500 py-10">Terjadi kesalahan pada tampilan transaksi.</div>;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24 font-jakarta w-full">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-[#F9FAFB] z-20 w-full">
        <div className="w-full max-w-[434px] mx-auto px-2 sm:px-4 pt-6 pb-4">
          <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="p-2 text-gray-600">
              <IoArrowBack size={24} />
            </button>
            <h1 className="flex-1 text-center text-xl font-bold">Transaksi</h1>
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
