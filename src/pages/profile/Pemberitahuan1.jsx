// src/pages/Pemberitahuan.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoArrowBack,
  IoTicketOutline,
  IoNotificationsOutline,
} from 'react-icons/io5';

export default function Pemberitahuan() {
  const navigate = useNavigate();

  const notifications = [
    {
      id: '1',
      type: 'voucher',
      icon: IoTicketOutline,
      title: 'Voucher Cashback s/d Rp 20.000',
      time: 'Hari ini, 10.03',
      subtitle:
        'Voucher s.d. 40% buat kamu dengan pembayaran via QRIS BCA. Dapatkan sekarang!',
      imageUrl: '/Voucher1.png',
    },
    {
      id: '2',
      type: 'voucher',
      icon: IoTicketOutline,
      title: 'Cashback 25% di Grand Indonesia',
      time: 'Hari ini, 10.03',
      subtitle:
        'Voucher s.d. 40% buat kamu dengan pembayaran via QRIS BCA. Dapatkan sekarang!',
      imageUrl: '/Voucher2.png',
    },
    {
      id: '3',
      type: 'voucher',
      icon: IoTicketOutline,
      title: 'Gift Voucher Rp 25.000',
      time: 'Hari ini, 10.03',
      subtitle:
        'Voucher s.d. 40% buat kamu dengan pembayaran via QRIS BCA. Dapatkan sekarang!',
      imageUrl: '/Voucher3.png',
    },
    // Contoh notification biasa
    {
      id: '4',
      type: 'message',
      icon: IoNotificationsOutline,
      title: 'Sporta Fit',
      time: 'Hari ini, 10.03',
      subtitle:
        'Yeay! Jadwal booking badminton kamu berhasil! Yuk cek sekarang jadwal booking kamu!',
    },
    {
      id: '5',
      type: 'message',
      icon: IoNotificationsOutline,
      title: 'Sporta Fit',
      time: 'Hari ini, 10.03',
      subtitle:
        'Yeay! Jadwal booking futsal kamu berhasil! Yuk cek sekarang jadwal booking kamu!',
    },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#F9FAFB] flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-[434px] bg-white rounded-3xl overflow-hidden shadow-md">
        {/* Header */}
        <div className="flex items-center h-14 px-4 border-b bg-white">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <IoArrowBack size={22} />
          </button>
          <h1 className="flex-1 text-center font-jakarta font-bold text-lg">
            Pemberitahuan
          </h1>
          <div className="w-6" />
        </div>

        {/* Daftar Notifikasi */}
        <div className="divide-y">
          {notifications.map((n) => {
            const Icon = n.icon;
            return (
              <div key={n.id} className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Icon
                      size={20}
                      className={`${
                        n.type === 'voucher'
                          ? 'text-sporta-orange'
                          : 'text-sporta-blue'
                      }`}
                    />
                    <span className="ml-2 font-jakarta font-medium text-sm">
                      {n.title}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{n.time}</span>
                </div>
                <p className="mt-1 text-xs text-gray-600">{n.subtitle}</p>
                {n.type === 'voucher' && n.imageUrl && (
                  <img
                    src={n.imageUrl}
                    alt={n.title}
                    className="mt-3 w-full h-[120px] object-cover rounded-lg"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = n.id % 2 === 0
                        ? "https://via.placeholder.com/400x200/6366f1/ffffff?text=Cashback+25%"
                        : "https://via.placeholder.com/400x200/1e40af/ffffff?text=Voucher+Cashback";
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
