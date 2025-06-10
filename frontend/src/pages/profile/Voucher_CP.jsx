import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';

export default function CaraMenggunakanVoucher() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-[434px] bg-white rounded-3xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center h-14 px-4 border-b bg-white">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <IoArrowBack size={22} />
          </button>
          <h1 className="flex-1 text-center font-jakarta font-bold text-lg">
            Cara Menggunakan Voucher
          </h1>
          <div className="w-6" />
        </div>

        {/* Konten */}
        <div className="p-6 overflow-y-auto max-h-[calc(100vh-112px)] font-jakarta text-sm text-gray-700 space-y-3 leading-relaxed">
          <p>1. Pastikan aplikasi Sporta Fit Anda sudah diperbarui ke versi terbaru.</p>
          <p>2. Masuk ke menu “Profile” lalu pilih “Kupon”.</p>
          <p>3. Pilih voucher yang ingin digunakan.</p>
          <p>4. Klik “PAKAI” dan Anda akan diarahkan ke halaman utama pemesanan lapangan.</p>
          <p>5. Masukkan lokasi tempat Anda ingin bermain di kolom pencarian di bagian atas layar.</p>
          <p>6. Pilih jenis olahraga dan lapangan yang ingin Anda pesan (seperti badminton, futsal, billiard, dll.).</p>
          <p>7. Potongan harga akan secara otomatis diterapkan sesuai nilai voucher saat Anda melanjutkan ke pembayaran.</p>
        </div>
      </div>
    </div>
  );
}
