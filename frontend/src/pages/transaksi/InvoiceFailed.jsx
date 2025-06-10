import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import logo from "/Logo.png";

export default function InvoiceFailed() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-jakarta px-4 pt-6 pb-12 flex flex-col items-center justify-center">
      <div className="max-w-[434px] w-full bg-white rounded-2xl p-6 shadow flex flex-col items-center">
        <img src={logo} alt="Sporta Fit" className="w-24 mb-6" />
        <div className="text-center text-white bg-red-500 py-1 px-4 rounded-full mb-6 font-bold text-lg">
          Gagal / Kadaluarsa
        </div>
        <div className="text-center text-2xl font-bold text-red-600 mb-2">
          Transaksi Tidak Berhasil
        </div>
        <div className="text-center text-gray-600 mb-6">
          Maaf, transaksi dengan ID <span className="font-mono font-semibold">#{id}</span> gagal diproses atau sudah kadaluarsa.<br />
          Silakan lakukan pemesanan ulang atau hubungi admin jika Anda merasa ini adalah kesalahan.
        </div>
        <button
          onClick={() => navigate("/list-pemesanan")}
          className="mb-2 px-4 py-2 bg-blue-500 text-white rounded w-full"
        >
          Kembali ke Riwayat Pemesanan
        </button>
        <button
          onClick={() => navigate("/home")}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded w-full"
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
}
