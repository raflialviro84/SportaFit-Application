// c:/xampp/htdocs/SPORTAFIT/src/components/BookingCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale'; // Import Indonesian locale
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaMoneyBillWave, FaCreditCard, FaHourglassHalf } from 'react-icons/fa';

// Helper to check if a booking is expired
const isExpired = (expiryTime) => {
  if (!expiryTime) return true; // If no expiry time, treat as expired to be safe
  return parseISO(expiryTime) < new Date();
};

// Helper to calculate time remaining (returns minutes)
const getTimeRemaining = (expiryTime) => {
  if (!expiryTime) return 0;
  
  const now = new Date();
  const expiry = parseISO(expiryTime);
  const diffMs = expiry - now;
  
  if (diffMs <= 0) return 0;
  return Math.floor(diffMs / 60000); // Convert ms to minutes
};

export default function BookingCard({ booking, onViewDetails, isAdminView = false }) {
  const navigate = useNavigate();

  if (!booking) {
    return null;
  }

  const {
    invoice_number,
    arena_name,
    court_name,
    booking_date_formatted,
    booking_date,
    start_time_formatted,
    start_time,
    end_time_formatted,
    end_time,
    status,
    payment_status,
    payment_method,
    expiry_time,
    final_total_amount,
    discount_amount,
  } = booking;

  const isBookingExpired = isExpired(expiry_time);
  const isPendingUnpaid = status === 'pending' && payment_status === 'unpaid';
  const canContinuePayment = isPendingUnpaid && !isBookingExpired;
  const remainingMinutes = getTimeRemaining(expiry_time);

  // Condition for when the payment time has expired for an unpaid booking
  const isFailedPaymentExpired =
    payment_status === 'unpaid' &&
    isBookingExpired &&
    (status === 'pending' || status === 'expired');

  const handleContinuePayment = (e) => {
    e.stopPropagation(); // Prevent card click when clicking the button
    if (canContinuePayment && invoice_number) {
      navigate(`/payment-detail/${invoice_number}`);
    }
  };

  const handleCardClick = () => {
    // If onViewDetails is provided, call it first
    if (onViewDetails) {
      onViewDetails(booking);
      return;
    }
    
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
  
  // Safely format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      if (typeof dateString === 'string' && dateString.includes('T')) {
        return format(parseISO(dateString), 'dd MMMM yyyy', { locale: id });
      }
      return dateString;
    } catch (e) {
      return dateString;
    }
  };
  
  // Safely format times
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString.substring(0, 5); // Format as HH:MM
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

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div 
      className={`bg-white shadow-sm rounded-lg p-3 sm:p-4 mb-4 border ${
        isBookingExpired && isPendingUnpaid ? 'border-red-200 bg-red-50' : 
        canContinuePayment ? 'border-yellow-200 bg-yellow-50' : 
        'border-gray-200'
      } ${onViewDetails || isFailedPaymentExpired ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''} relative`}
      onClick={handleCardClick}
    >
      {/* Urgent countdown for pending payment with < 30 minutes left */}
      {canContinuePayment && remainingMinutes < 30 && (
        <div className="absolute top-0 right-0 m-2 flex items-center bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
          <FaHourglassHalf className="mr-1" size={10} />
          {remainingMinutes <= 0 ? 'Segera berakhir' : `${remainingMinutes} menit tersisa`}
        </div>
      )}

      <div className="flex flex-wrap justify-between items-start mb-3 gap-2">
        <div className="min-w-[120px]">
          <h3 className="text-xs text-gray-500">ID Booking:</h3>
          <p className="text-sm font-bold text-blue-600 break-all">{invoice_number || 'N/A'}</p>
        </div>
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${getStatusClass()}`}
        >
          {displayStatus()}
        </span>
      </div>

      {/* Location, date and time section */}
      <div className="space-y-2 mb-3">
        <div className="flex items-start gap-2">
          <FaMapMarkerAlt className="text-green-500 mt-0.5 flex-shrink-0" size={14} />
          <div>
            <p className="text-sm font-semibold text-gray-800 line-clamp-1">
              {arena_name || 'Nama Arena'} 
              <span className="font-normal text-gray-600"> - {court_name || 'Nama Lapangan'}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <FaCalendarAlt className="text-blue-500 flex-shrink-0" size={12} />
          <p className="text-xs text-gray-600">
            {formatDate(booking_date_formatted || booking_date) || 'Tanggal tidak tersedia'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <FaClock className="text-purple-500 flex-shrink-0" size={12} />
          <p className="text-xs text-gray-600">
            {formatTime(start_time_formatted || start_time)} - {formatTime(end_time_formatted || end_time)}
          </p>
        </div>
      </div>
      
      {/* Payment information */}
      <div className="border-t border-gray-200 pt-3">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <FaMoneyBillWave className="text-teal-500 flex-shrink-0" size={12} />
            <span className="text-xs text-gray-600">Total:</span>
          </div>
          <span className="text-sm font-bold text-gray-800">
            {formatCurrency(final_total_amount || 0)}
          </span>
        </div>
        
        {discount_amount > 0 && (
          <div className="flex justify-between items-center mb-2 text-green-600">
            <span className="text-xs">Diskon:</span>
            <span className="text-xs font-medium">-{formatCurrency(discount_amount)}</span>
          </div>
        )}
        
        {payment_method && (
          <div className="flex items-center gap-2 mb-2">
            <FaCreditCard className="text-gray-500 flex-shrink-0" size={12} />
            <span className="text-xs text-gray-500">
              {payment_method}
            </span>
          </div>
        )}

        {/* Action buttons */}
        {canContinuePayment && (
          <div className="mt-3">
            <button
              onClick={handleContinuePayment}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 text-sm"
            >
              Lanjutkan Pembayaran
            </button>
            {expiry_time && !isBookingExpired && (
              <p className="text-xs text-center text-red-500 mt-1">
                Bayar sebelum: {formattedExpiryTime}
              </p>
            )}
          </div>
        )}

        {isFailedPaymentExpired && (
          <div className="mt-3">
            <p className="text-xs text-center text-red-600 font-medium p-2 bg-red-50 rounded-md">
              Waktu pembayaran telah berakhir. Silahkan lakukan pemesanan kembali.
            </p>
          </div>
        )}
        
        {onViewDetails && !canContinuePayment && !isFailedPaymentExpired && (
          <div className="mt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(booking);
              }}
              className="w-full text-blue-600 border border-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded-lg transition duration-150 text-sm"
            >
              {isAdminView ? "Edit Status" : "Lihat Detail"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

