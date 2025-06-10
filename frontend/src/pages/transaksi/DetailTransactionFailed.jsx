// src/pages/transaksi/DetailTransactionFailed.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import TransactionService from "../../services/transactionService";

export default function DetailTransactionFailed() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching transaction for DetailTransactionFailed with ID:', id);
        const data = await TransactionService.getTransactionById(id);
        console.log('Transaction data from backend:', data);

        if (data) {
          const enhancedData = {
            ...data,
            status: data.status || 'Gagal', // Default to 'Gagal', or 'Expired' if backend sets it
            
            id: data.id || data.booking?.id,
            formattedDate: data.bookingDate ? new Date(data.bookingDate).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) : (data.date || "Tanggal tidak tersedia"),
            time: data.bookingStartTime && data.bookingEndTime ? `${data.bookingStartTime.substring(0,5)} – ${data.bookingEndTime.substring(0,5)}` : (data.time || "Waktu tidak tersedia"),

            arenaName: data.arenaName || data.booking?.arenaName || '-',
            venueSubtitle: data.venueSubtitle || '-', // Corrected to directly use venueSubtitle from backend data

            courtName: data.courtName || data.booking?.courtName || '-', // Corrected to use courtName

            user: (data.user || data.booking?.user) ? {
              name: (data.user?.name || data.booking?.user?.name) || 'Tidak tersedia',
              email: (data.user?.email || data.booking?.user?.email) || 'Tidak tersedia',
              phone: (data.user?.phone || data.booking?.user?.phone) || 'Tidak tersedia'
            } : { name: 'Tidak tersedia', email: 'Tidak tersedia', phone: 'Tidak tersedia' },
            
            paymentMethod: data.paymentMethod || data.booking?.paymentMethod || '-',
            
            totalPrice: data.totalPrice ?? data.booking?.totalPrice ?? data.total_price ?? 0,
            discount: data.discount ?? data.booking?.discount ?? data.promo ?? 0,
            serviceFee: data.serviceFee ?? data.booking?.serviceFee ?? data.service_fee ?? 5000,
            protectionFee: data.protectionFee ?? data.booking?.protectionFee ?? data.protection_fee ?? 0,
            
            finalTotalAmount: data.totalAmount ?? data.finalTotalAmount ?? data.final_total_amount ?? null, // Let it be calculated if null

            // Aliases for compatibility with price calculation logic
            total_price: data.total_price ?? data.totalPrice ?? data.booking?.totalPrice ?? 0,
            service_fee: data.service_fee ?? data.serviceFee ?? data.booking?.serviceFee ?? 5000,
            protection_fee: data.protection_fee ?? data.protectionFee ?? data.booking?.protectionFee ?? 0,
            promo: data.promo ?? data.discount ?? data.booking?.discount ?? 0,
          };
          console.log('Enhanced transaction data for DetailTransactionFailed:', enhancedData);
          setTransaction(enhancedData);
        } else {
          console.log('Transaction not found by ID:', id, '- No data returned from API.');
          setError('Transaksi tidak ditemukan.');
        }
      } catch (err) {
        console.error('Error fetching transaction for ID:', id, err);
        setError('Gagal mengambil detail transaksi. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTransaction();
    } else {
      console.log('No ID provided for DetailTransactionFailed page.');
      setError('ID transaksi tidak valid.');
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] font-jakarta flex flex-col items-center">
        <header className="fixed top-0 left-0 right-0 bg-[#F9FAFB] z-30 shadow-sm w-full">
          <div className="max-w-[434px] mx-auto flex items-center px-4 py-4">
            <button onClick={() => navigate("/pemesanan")} className="p-2 text-gray-600">
              <IoArrowBack size={24} />
            </button>
            <h1 className="flex-1 text-center text-xl font-bold">
              Detail Pemesanan
            </h1>
            <div className="w-6" /> {/* Spacer */}
          </div>
        </header>
        <main className="pt-20 max-w-[434px] mx-auto px-4 text-center flex-grow flex flex-col justify-center">
          <div>
            <h2 className="text-xl font-semibold text-red-500 mb-2">
              {error || 'Gagal Memuat Detail Transaksi'}
            </h2>
            <p className="text-gray-600">
              {error ? error : `Tidak dapat menemukan detail untuk transaksi ${id ? <>dengan ID: <span className="font-mono font-semibold">{id}</span></> : "ini"}.`}
            </p>
            {!error && (
              <p className="text-gray-600 mt-2">
                Ini mungkin karena transaksi tidak ada, sudah kadaluarsa, atau terjadi kesalahan saat mengambil data.
              </p>
            )}
            <button
              onClick={() => navigate("-1")}
              className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Kembali ke Beranda
            </button>
          </div>
        </main>
      </div>
    );
  }

  const tx = transaction;

  // Price calculation logic from DetailTransactions.jsx
  const price = tx.totalPrice ?? tx.total_price ?? 0;
  const serviceFee = tx.serviceFee ?? tx.service_fee ?? 0;
  const protectionFee = tx.protectionFee ?? tx.protection_fee ?? 0;
  const promo = tx.discount ?? tx.promo ?? 0;
  const totalPayment = tx.finalTotalAmount ?? tx.final_total_amount ?? (price + serviceFee + protectionFee - promo);

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-jakarta">

      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-[#F9FAFB] z-30 shadow-sm">
        <div className="max-w-[434px] mx-auto flex items-center px-4 py-4">
          <button onClick={() => navigate("/")} className="p-2 text-gray-600"> {/* Back to home */}
            <IoArrowBack size={24} />
          </button>
          <h1 className="flex-1 text-center text-xl font-bold">
            Detail Transaksi
          </h1>
          <div className="w-6" />
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="pt-20 pb-24 max-w-[434px] mx-auto px-4 space-y-6">

        {/* Status Gagal/Kadaluarsa */}
        <div className={`rounded-lg text-white text-center py-1 ${
          tx.status && tx.status.toLowerCase() === 'cancelled_by_system'
            ? 'bg-gray-400'
            : 'bg-red-500'
        }`}>
          {tx.status && tx.status.toLowerCase() === 'cancelled_by_system'
            ? 'DIBATALKAN OLEH SISTEM'
            : (tx.status && tx.status.toUpperCase() === 'EXPIRED')
              ? 'KADALUARSA'
              : 'GAGAL'}
        </div>

        {/* ID & Waktu */}
        <section className="space-y-1">
          <div className="text-sm">
            <span className="font-semibold">ID Transaksi:</span> {tx.id || "Tidak tersedia"}
          </div>
          <div className="text-sm text-gray-600">
            {tx.formattedDate || "Tanggal tidak tersedia"} | {tx.time || "Waktu tidak tersedia"}
          </div>
        </section>

        {/* Tempat */}
        <section className="space-y-1">
          <div className="text-sm font-semibold">Tempat</div>
          <div className="text-sm">{tx.arenaName ? tx.arenaName : 'Nama arena tidak tersedia'}</div>
          <div className="text-sm text-gray-600">{tx.venueSubtitle ? tx.venueSubtitle : 'Alamat tidak tersedia'}</div>
        </section>

        {/* Aktivitas/Lapangan + Invoice */}
        <section className="flex items-center justify-between">
          <div className="text-sm font-semibold">
            {/* Displaying as "Aktivitas" or "Lapangan" based on context if needed, default to courtName */}
            {tx.courtName ? (tx.courtName.toLowerCase().includes("lapangan") ? `Lapangan: ${tx.courtName.replace(/Lapangan /i, '')}` : tx.courtName) : "Aktivitas tidak tersedia"}
          </div>
          <button
            onClick={() => navigate(`/invoice-failed/${tx.id}`)} // Navigate to invoice-failed
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-100"
            disabled={!tx.id}
          >
            Lihat Invoice
          </button>
        </section>

        <div className="border-b border-gray-200 my-4" />

        {/* Data Pengguna */}
        {tx.user && (tx.user.name !== 'Tidak tersedia' || tx.user.email !== 'Tidak tersedia' || tx.user.phone !== 'Tidak tersedia') ? (
          <section className="bg-white rounded-2xl shadow px-4 py-4 space-y-3">
            <div>
              <div className="text-xs text-gray-500">Nama</div>
              <div className="text-sm">{tx.user.name || "Tidak tersedia"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Email</div>
              <div className="text-sm">{tx.user.email || "Tidak tersedia"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">No. HP</div>
              <div className="text-sm">{tx.user.phone || "Tidak tersedia"}</div>
            </div>
          </section>
        ) : (
          <section className="bg-white rounded-2xl shadow px-4 py-4">
            <div className="text-sm text-center text-gray-500">
              Data pengguna tidak tersedia.
            </div>
          </section>
        )}

        <div className="border-b border-gray-200 my-4" />

        {/* Ringkasan Pemesanan */}
        <section className="bg-gray-100 rounded-2xl px-4 py-4 space-y-3">
          <div className="text-sm font-semibold">Ringkasan Pemesanan</div>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Metode Pembayaran</span>
              <span className="font-medium">{tx.paymentMethod || tx.payment_method || tx.payment?.method || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span>Status Pemesanan</span>
              <span className="font-medium">
                {tx.status && tx.status.toLowerCase() === 'cancelled_by_system'
                  ? 'DIBATALKAN OLEH SISTEM'
                  : (tx.status && tx.status.toUpperCase() === 'EXPIRED')
                    ? 'KADALUARSA'
                    : 'GAGAL'}
              </span>
            </div>
            <div className="flex justify-between">
              {/* Using "Harga Lapangan" or "Harga Aktivitas" based on context, default to "Harga" */}
              <span>{tx.courtName ? "Harga Lapangan" : "Total Harga"}</span>
              <span className="font-medium">
                Rp{price.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Promo</span>
              <span className="font-medium text-green-600">
                - Rp{promo.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Biaya Layanan</span>
              <span className="font-medium">
                Rp{serviceFee.toLocaleString('id-ID')}
              </span>
            </div>
            {protectionFee > 0 && ( // Only show protection if it's more than 0
              <div className="flex justify-between">
                <span>Proteksi</span>
                <span className="font-medium">
                  Rp{protectionFee.toLocaleString('id-ID')}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-semibold">Total Pembayaran</span>
              <span className="font-semibold">
                Rp{totalPayment.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
