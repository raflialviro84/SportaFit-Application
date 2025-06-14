// src/pages/pemesanan/Invoice.jsx

import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import logo from "/Logo.png";
import TransactionService from "../../services/transactionService";

export default function Invoice() {
  const navigate = useNavigate();
  const { id } = useParams();
  const invoiceRef = useRef();
  const [loading, setLoading] = useState(true);
  const [transactionData, setTransactionData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      if (!id) {
        setError("ID transaksi tidak ditemukan.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await TransactionService.getTransactionById(id);
        if (!data) {
          setError("Transaksi tidak ditemukan.");
        } else {
          console.log("Fetched Transaction Data for Debugging:", data); // Re-add console.log for debugging
          // Cek status pesanan dan status pembayaran sesuai backend
          const statusOrder = (data.status || '').toLowerCase();
          const statusPayment = (data.payment_status || '').toLowerCase();
          // Jika status benar-benar gagal, redirect ke InvoiceFailed
          if (
            statusOrder === 'cancelled' ||
            statusOrder === 'expired' ||
            statusOrder === 'failed' ||
            statusPayment === 'failed'
          ) {
            navigate(`/invoice-failed/${id}`, { replace: true });
            return;
          }
          setTransactionData(data);
        }
      } catch {
        setError("Gagal mengambil data transaksi.");
      } finally {
        setLoading(false);
      }
    };
    fetchTransactionDetails();
  }, [id, navigate]);

  // Format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    } catch {
      return 'Invalid Date';
    }
  };
  const formatDateForItem = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
    } catch {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] font-jakarta px-4 pt-6 pb-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] font-jakarta px-4 pt-6 pb-12 flex justify-center items-center">
        <div className="bg-white p-8 rounded shadow text-center">
          <div className="text-red-600 font-bold mb-2">{error}</div>
          <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Kembali</button>
        </div>
      </div>
    );
  }
  if (!transactionData) {
    return null;
  }

  // --- MAPPING BENAR-BENAR DINAMIS SESUAI BACKEND ---
  const user = transactionData.user || {};
  const court = transactionData.court || {};;

  // Item booking (hanya satu baris, bukan array timeSlots)
  const item = {
    arenaName: transactionData.arenaName || '-',
    courtName: transactionData.courtName || '-',
    date: transactionData.date ? formatDateForItem(transactionData.date) : '-',
    time: transactionData.time || '-',
    totalPrice: typeof transactionData.totalPrice === 'number' ? transactionData.totalPrice : 0,
  };

  // Subtotal, fee, promo, total
  const subTotal = typeof transactionData.totalPrice === 'number' ? transactionData.totalPrice : 0;
  const fee = typeof transactionData.serviceFee === 'number' ? transactionData.serviceFee : 0;
  const promo = typeof transactionData.discount === 'number' ? transactionData.discount : 0;
  const protection = typeof transactionData.protectionFee === 'number' ? transactionData.protectionFee : 0;
  const total = typeof transactionData.finalTotalAmount === 'number'
    ? transactionData.finalTotalAmount
    : (subTotal + fee + protection - promo);

  // Status
  const statusOrder = (transactionData.status || '').toLowerCase();
  const statusPayment = (transactionData.payment_status || '').toLowerCase();
  const isSuccess = (statusOrder === 'completed' || statusOrder === 'confirmed') && (statusPayment === 'paid');

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-jakarta px-4 pt-6 pb-12">
      {/* Header */}
      <div className="flex items-center mb-4">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-600">
          <IoArrowBack size={24} />
        </button>
        <h1 className="flex-1 text-center text-xl font-bold">
          Invoice <span className="font-mono">#{transactionData.invoice_number || transactionData.id}</span>
        </h1>
        <button
          onClick={handlePrint}
          className="text-blue-600 text-sm font-medium"
        >
          Unduh
        </button>
      </div>

      {/* Container Cetak */}
      <div
        ref={invoiceRef}
        className="max-w-[434px] mx-auto bg-white rounded-2xl p-6 shadow print:shadow-none print:bg-transparent"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Sporta Fit" className="w-24" />
        </div>

        {/* Status Bar */}
        <div
          className="text-center text-white py-1 mb-6 rounded-full bg-green-500"
        >
          BERHASIL
        </div>

        {/* Header Info */}
        <div className="text-center text-xs text-gray-500 mb-1">
          Sporta Fit Indonesia
        </div>
        <div className="text-center text-sm font-mono font-semibold mb-6">
          #{transactionData.invoice_number || transactionData.id}
        </div>

        {/* Grid Tanggal & Status */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm mb-6">
          <div>
            <div className="font-medium">Waktu Pemesanan</div>
            <div>{transactionData.created_at ? formatDate(transactionData.created_at) : '-'}</div>
          </div>
          <div>
            <div className="font-medium">Status Pesanan</div>
            {(() => {
              const status = (transactionData.status || '').toLowerCase();
              if (status === 'completed' || status === 'confirmed') {
                return <div className="text-green-600 font-bold">BERHASIL</div>;
              } else if (status === 'cancelled' || status === 'expired' || status === 'failed') {
                return <div className="text-red-600 font-bold">GAGAL</div>;
              } else {
                return <div className="text-gray-600">{transactionData.status || '-'}</div>;
              }
            })()}
          </div>
          <div>
            <div className="font-medium">Waktu Pembayaran</div>
            <div>
              {transactionData.updated_at ? formatDate(transactionData.updated_at) : '-'}
            </div>
          </div>
          <div>
            <div className="font-medium">Status Pembayaran</div>
            {(() => {
              const payStatus = (transactionData.paymentStatus || '').toLowerCase(); // Changed to paymentStatus
              if (payStatus === 'paid') {
                return <div className="text-green-600 font-bold">TERBAYAR</div>;
              } else if (payStatus === 'unpaid') {
                return <div className="text-red-600 font-bold">TIDAK DI BAYAR</div>;
              } else {
                return <div className="text-gray-600">{transactionData.paymentStatus || '-'}</div>;
              }
            })()}
          </div>
        </div>

        <hr className="border-gray-200 mb-6" />

        {/* Tagihan & Pembayaran Untuk */}
        <div className="grid grid-cols-2 gap-x-6 mb-6 text-sm">
          <div>
            <div className="font-medium text-gray-600 mb-1">Tagihan Untuk</div>
            <div className="font-semibold">{user.name || '-'}</div>
            <div className="text-gray-600">{user.phone || '-'}</div>
            <div className="text-gray-600">{user.email || '-'}</div>
          </div>
        </div>

        <hr className="border-gray-200 mb-6" />

        {/* Tabel Item */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-sporta-blue text-white">
                {["Tempat", "Lapangan", "Tanggal", "Jam", "Harga"].map((h) => (
                  <th key={h} className="px-2 py-1">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-2 py-2">{item.arenaName}</td>
                <td className="px-2 py-2">{item.courtName}</td>
                <td className="px-2 py-2">{item.date}</td>
                <td className="px-2 py-2">{item.time}</td>
                <td className="px-2 py-2">Rp{(item.totalPrice || 0).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <hr className="border-gray-200 mb-6" />

        {/* Ringkasan Biaya */}
        <div className="space-y-2 text-sm mb-6">
          <div className="flex justify-between">
            <span>Sub Total</span>
            <span>Rp{subTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Biaya Layanan</span>
            <span>Rp{fee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Proteksi</span>
            <span>Rp{protection.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Promo</span>
            <span className="text-green-600">- Rp{promo.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total Pembayaran</span>
            <span>Rp{total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Metode Pembayaran</span>
            <span>{transactionData.paymentMethod || transactionData.payment_method || '-'}</span>
          </div>
        </div>

        <hr className="border-gray-200 mb-4" />

        {/* Catatan */}
        <div className="text-xs text-gray-500">
          **Catatan: Ini adalah tanda terima sah yang dihasilkan sistem dan tidak
          memerlukan tanda tangan fisik.
        </div>
      </div>
    </div>
  );
}
