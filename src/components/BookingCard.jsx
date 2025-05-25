// c:/xampp/htdocs/SPORTAFIT/src/components/BookingCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale'; // Import Indonesian locale

// Helper to check if a booking is expired
const isExpired = (expiryTime) => {
  if (!expiryTime) return true; // If no expiry time, treat as expired to be safe
  return parseISO(expiryTime) < new Date();
};

export default function BookingCard({ booking }) {
  const navigate = useNavigate();

  if (!booking) {
    return null;
  }

  const {
    invoice_number,
    arena_name,
    court_name,
    booking_date_formatted,
    start_time_formatted,
    end_time_formatted,
    status,
    payment_status,
    expiry_time,
    final_total_amount,
  } = booking;

  const isBookingExpired = isExpired(expiry_time);
  const isPendingUnpaid = status === 'pending' && payment_status === 'unpaid';

  const canContinuePayment = isPendingUnpaid && !isBookingExpired;

  // Condition for when the payment time has expired for an unpaid booking
  const isFailedPaymentExpired =
    payment_status === 'unpaid' &&
    isBookingExpired &&
    (status === 'pending' || status === 'expired');

  const handleContinuePayment = () => {
    if (canContinuePayment && invoice_number) {
      navigate(`/payment-detail/${invoice_number}`);
    }
  };

  const handleCardClick = () => {
    // Only navigate if it's a failed payment scenario
    if (isFailedPaymentExpired && invoice_number) {
      navigate(`/transaksi/failed/${invoice_number}`);
    }
  };

  const displayStatus = () => {
    if (isPendingUnpaid) {
      if (isBookingExpired) return "Kadaluarsa";
      return "Menunggu Pembayaran";
    }
    if (status === 'confirmed' || status === 'completed') return "Berhasil";
    // Explicitly check for 'expired' or 'cancelled' after pending checks
    if (status === 'expired') return "Kadaluarsa";
    if (status === 'cancelled') return "Dibatalkan";
    return status; // Default fallback
  };

  const getStatusClass = () => {
    if (isPendingUnpaid) {
      if (isBookingExpired) return "bg-red-100 text-red-700";
      return "bg-yellow-100 text-yellow-700";
    }
    if (status === 'confirmed' || status === 'completed') return "bg-green-100 text-green-700";
    if (status === 'expired' || status === 'cancelled') return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };
  
  // Safely format expiry_time
  let formattedExpiryTime = 'N/A';
  if (expiry_time) {
    try {
      formattedExpiryTime = format(parseISO(expiry_time), 'dd MMM yyyy, HH:mm', { locale: id });
    } catch (e) {
      console.error("Error formatting expiry time:", e);
      // Keep N/A or use a fallback
    }
  }

  return (
    <div 
      className={`bg-white shadow-md rounded-lg p-4 mb-4 border border-gray-200 ${isFailedPaymentExpired ? 'cursor-pointer hover:shadow-lg' : ''}`}
      onClick={isFailedPaymentExpired ? handleCardClick : undefined}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-500">ID Transaksi:</h3>
          <p className="text-md font-bold text-blue-600">{invoice_number || 'N/A'}</p>
        </div>
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusClass()}`}
        >
          {displayStatus()}
        </span>
      </div>

      <div className="mb-3">
        <p className="text-lg font-semibold text-gray-800">{arena_name || 'Nama Arena'} - {court_name || 'Nama Lapangan'}</p>
        <p className="text-sm text-gray-600">
          {booking_date_formatted || 'Tanggal tidak tersedia'}
        </p>
        <p className="text-sm text-gray-600">
          {start_time_formatted && end_time_formatted ? `${start_time_formatted} - ${end_time_formatted}` : 'Waktu tidak tersedia'}
        </p>
      </div>
      
      <div className="border-t border-gray-200 pt-3">
        <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">Total Pembayaran:</span>
            <span className="text-md font-bold text-gray-800">
              Rp{final_total_amount ? final_total_amount.toLocaleString('id-ID') : '0'}
            </span>
        </div>

        {canContinuePayment && (
          <div className="mt-4">
            <button
              onClick={handleContinuePayment}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-150"
            >
              Lanjutkan Pembayaran
            </button>
            {expiry_time && !isBookingExpired && ( // Show payment deadline only if payment can be continued
              <p className="text-xs text-center text-red-500 mt-2">
                Bayar sebelum: {formattedExpiryTime}
              </p>
            )}
          </div>
        )}

        {/* Show this message if payment is unpaid and expired, regardless of whether status is 'pending' or already 'expired' */}
        {isFailedPaymentExpired && (
          <div className="mt-3">
            <p className="text-sm text-center text-red-600 font-medium p-2 bg-red-50 rounded-md">
              Waktu pembayaran untuk pesanan ini telah berakhir. Silahkan lakukan pemesanan kembali.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

