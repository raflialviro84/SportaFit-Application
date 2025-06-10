import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';

export default function SyaratKetentuan() {
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
            Syarat &amp; Ketentuan
          </h1>
          <div className="w-6" />
        </div>

        {/* Konten panjang */}
        <div className="p-6 overflow-y-auto max-h-[calc(100vh-112px)] font-jakarta text-sm text-gray-700 space-y-3 leading-relaxed">
          <p>1. Voucher ini hanya berlaku untuk pemesanan lapangan melalui Sporta Fit.</p>
          <p>2. Voucher dapat ditukarkan hingga tanggal yang tertera pada voucher ini, atau selama kuota voucher masih tersedia (mana yang lebih dahulu).</p>
          <p>3. Diskon hanya berlaku untuk biaya sewa lapangan. Diskon tidak berlaku untuk harga makanan/minuman atau produk lain di lokasi.</p>
          <p>4. Voucher berlaku untuk semua metode pembayaran.</p>
          <p>5. Hanya berlaku untuk 1 (satu) transaksi.</p>
          <p>6. Jika total transaksi melebihi nominal voucher, selisih pembayaran dapat dibayar dengan uang tunai atau metode pembayaran lain seperti e‑wallet atau dompet digital.</p>
          <p>7. Sporta Fit saat ini beroperasi di beberapa kota besar di Indonesia dan akan mengarahkan Anda ke lokasi lapangan terdekat.</p>
          <p>8. Jam operasional Sporta Fit: 08:00 – 21:30 WIB.</p>
          <p>9. Voucher tidak dapat digabungkan dengan promosi lainnya.</p>
          <p>10. Voucher yang sudah diterima tidak dapat ditukar dengan voucher lain (tidak dapat ditukar), tidak dapat dikembalikan, dan tidak dapat diperpanjang masa berlakunya.</p>
          <p>11. Sporta Fit berhak membatalkan transaksi/penggunaan voucher jika terdapat indikasi kecurangan atau penyalahgunaan.</p>
          <p>12. Sporta Fit berhak membatalkan transaksi/penggunaan voucher kapan saja tanpa pemberitahuan sebelumnya kepada pengguna.</p>
          <p>13. Sporta Fit berhak mengubah syarat dan ketentuan promo kapan saja tanpa pemberitahuan sebelumnya.</p>
          <p>14. Dengan mengikuti promo ini, Anda dianggap telah memahami dan menyetujui syarat dan ketentuan yang berlaku.</p>
          <p>15. Voucher ini tidak boleh untuk pemesanan produk yang dilarang oleh hukum (misal narkoba, suku cadang ilegal, dan sejenisnya).</p>
          <p>16. Jika pengguna tetap menggunakan voucher sebagaimana dijelaskan pada poin 15 untuk tindakan yang dilarang, Sporta Fit tidak bertanggung jawab dan dapat menonaktifkan akun pengguna tersebut.</p>
        </div>
      </div>
    </div>
  );
}
