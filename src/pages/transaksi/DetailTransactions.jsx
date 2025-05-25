// src/pages/transaksi/DetailTransaction.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import TransactionService from "../../services/transactionService";

export default function DetailTransaction() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ambil data transaksi berdasarkan ID
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setLoading(true);
        setError(null);
        // Ambil data transaksi dari backend menggunakan TransactionService
        const data = await TransactionService.getTransactionById(id);
        if (data) {
          // Sinkronkan data user dan payment
          const enhancedData = {
            ...data,
            status: data.status || data.paymentStatus || 'Berhasil',
            totalPrice: data.totalPrice ?? data.total_price ?? 0,
            serviceFee: data.serviceFee ?? data.service_fee ?? 5000,
            promo: data.discount ?? 0,
            paymentMethod: data.paymentMethod || data.payment_method || '-',
            user: (data.user && (data.user.name || data.user.email || data.user.phone)) ? {
              name: data.user.name || 'Tidak tersedia',
              email: data.user.email || 'Tidak tersedia',
              phone: data.user.phone || 'Tidak tersedia'
            } : { name: 'Tidak tersedia', email: 'Tidak tersedia', phone: 'Tidak tersedia' },
            payment: {
              method: data.paymentMethod || data.payment_method || '-',
              status: data.status || data.paymentStatus || '-',
              price: data.totalPrice ?? data.total_price ?? 0,
              promo: data.discount ?? 0,
              fee: data.serviceFee ?? data.service_fee ?? 5000,
              total: data.finalTotalAmount ?? data.final_total_amount ?? ((data.totalPrice ?? data.total_price ?? 0) + (data.serviceFee ?? data.service_fee ?? 5000) - (data.discount ?? 0))
            }
          };
          setTransaction(enhancedData);
        } else {
          setError('Transaksi tidak ditemukan.');
        }
      } catch {
        setError('Gagal mengambil detail transaksi. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };
    fetchTransaction();
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
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-center items-center font-jakarta">
        <div className="text-red-600 font-bold text-lg mb-2">{error || 'Data transaksi tidak ditemukan.'}</div>
        <button onClick={() => navigate(-1)} className="mt-2 px-4 py-2 bg-sporta-blue text-white rounded-lg">Kembali</button>
      </div>
    );
  }

  const tx = transaction;

  // Ambil field sesuai backend
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
          <button onClick={() => navigate(-1)} className="p-2 text-gray-600">
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

        {/* Status */}
        <div className={`rounded-lg text-white text-center py-1 ${
          tx.status && (tx.status.toLowerCase() === 'completed' || tx.status.toLowerCase() === 'confirmed')
            ? 'bg-green-500'
            : 'bg-red-500'
        }`}>
          {tx.status && (tx.status.toLowerCase() === 'completed' || tx.status.toLowerCase() === 'confirmed')
            ? 'BERHASIL'
            : tx.status && tx.status.toUpperCase() === 'PENDING' 
            ? 'PENDING'
            : tx.status && tx.status.toUpperCase() === 'CANCELLED'
            ? 'GAGAL'
            : tx.status && tx.status.toUpperCase() === 'EXPIRED'
            ? 'KADALUARSA'
            : 'GAGAL'
          }
        </div>

        {/* ID & Waktu */}
        <section className="space-y-1">
          <div className="text-sm">
            <span className="font-semibold">ID Pembayaran:</span> {tx.id}
          </div>
          <div className="text-sm text-gray-600">
            {tx.formattedDate || tx.date} | {tx.time}
          </div>
        </section>

        {/* Tempat */}
        <section className="space-y-1">
          <div className="text-sm font-semibold">Tempat</div>
          <div className="text-sm">{tx.arenaName || '-'}</div>
          <div className="text-sm text-gray-600">{tx.venueSubtitle || tx.venue || '-'}</div>
        </section>

        {/* Lapangan + Invoice */}
        <section className="flex items-center justify-between">
          <div className="text-sm font-semibold">
            Lapangan: {tx.courtName ? tx.courtName.replace(/Lapangan /i, '') : '-'}
          </div>
          <button
            onClick={() => navigate(`/invoice/${tx.id}`)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-100"
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
          <section className="bg-white rounded-2xl shadow px-4 py-4 space-y-3">
            <div className="text-sm text-center text-gray-500">
              Data pengguna tidak tersedia
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
              <span>Status Pembayaran</span>
              <span className="font-medium">
                {tx.status && (tx.status.toLowerCase() === 'completed' || tx.status.toLowerCase() === 'confirmed')
                  ? 'LUNAS'
                  : tx.status && tx.status.toUpperCase() === 'PENDING'
                  ? 'PENDING'
                  : tx.status && tx.status.toUpperCase() === 'CANCELLED'
                  ? 'DIBATALKAN'
                  : tx.status && tx.status.toUpperCase() === 'EXPIRED'
                  ? 'KADALUARSA'
                  : 'GAGAL'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Harga Lapangan</span>
              <span className="font-medium">
                Rp{price.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Promo</span>
              <span className="font-medium">
                Rp{promo.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Biaya Layanan</span>
              <span className="font-medium">
                Rp{serviceFee.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Proteksi</span>
              <span className="font-medium">
                Rp{protectionFee.toLocaleString('id-ID')}
              </span>
            </div>
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
