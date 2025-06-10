// src/pages/TentangVoucher.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';

export default function TentangVoucher() {
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
            Tentang Voucher Ini
          </h1>
          <div className="w-6" />
        </div>

        {/* Konten */}
        <div className="p-6 font-jakarta text-sm text-gray-700 space-y-3 leading-relaxed">
          <p>Rp 12.000 di Pembelian Pertama Kamu!</p>
        </div>
      </div>
    </div>
  );
}
