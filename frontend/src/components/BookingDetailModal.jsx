import React from 'react';
import { IoClose } from 'react-icons/io5';
import { FaUser, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaCreditCard, FaMoneyBillWave, FaStickyNote } from 'react-icons/fa';

const BookingDetailModal = ({ isOpen, onClose, booking }) => {
  if (!isOpen || !booking) return null;

  // Function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount || 0);
  };

  // Format date to Indonesian format
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-3 md:p-4">
      <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 w-full max-w-xl relative overflow-y-auto max-h-[90vh]">
        <button 
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors" 
          onClick={onClose}
        >
          <IoClose size={20} />
        </button>
        
        <h2 className="text-lg md:text-xl font-bold mb-2 pr-8">Detail Booking</h2>
        <p className="text-sm text-gray-500 mb-4">{booking.invoiceNumber || booking.invoice_number || booking.id}</p>
        
        <div className="space-y-4">
          {/* Status Badge - Special Highlighted Section */}
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">Status</div>
              <div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  booking.status === 'paid' || booking.status === 'completed' ? 'bg-green-100 text-green-800' : 
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {booking.status === 'paid' || booking.status === 'completed' ? 'Selesai' : 
                   booking.status === 'pending' ? 'Menunggu Pembayaran' :
                   booking.status === 'cancelled' ? 'Dibatalkan' : 
                   booking.status === 'confirmed' ? 'Terkonfirmasi' : booking.status}
                </span>
              </div>
            </div>
            
            {/* Payment Status */}
            <div className="flex justify-between items-center mt-2">
              <div className="text-sm text-gray-600">Status Pembayaran</div>
              <div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  booking.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 
                  booking.payment_status === 'unpaid' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {booking.payment_status === 'paid' ? 'Lunas' : 
                   booking.payment_status === 'unpaid' ? 'Belum Bayar' : booking.payment_status || '-'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Main Information with Icons */}
          <div className="space-y-3">
            <div className="flex items-start border-b pb-2">
              <div className="w-8 h-8 flex-shrink-0 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                <FaUser className="text-blue-500" size={14} />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500">Pemesan</div>
                <div className="font-medium">{booking.user?.name || '-'}</div>
                <div className="text-xs text-gray-500">{booking.user?.email || booking.user?.phone || '-'}</div>
              </div>
            </div>
            
            <div className="flex items-start border-b pb-2">
              <div className="w-8 h-8 flex-shrink-0 rounded-full bg-green-50 flex items-center justify-center mr-3">
                <FaMapMarkerAlt className="text-green-500" size={14} />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500">Arena</div>
                <div className="font-medium">{booking.court?.arena?.name || booking.arena?.name || '-'}</div>
                <div className="text-xs text-gray-500">Lapangan: {booking.court?.name || '-'}</div>
              </div>
            </div>
            
            <div className="flex items-start border-b pb-2">
              <div className="w-8 h-8 flex-shrink-0 rounded-full bg-yellow-50 flex items-center justify-center mr-3">
                <FaCalendarAlt className="text-yellow-500" size={14} />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500">Tanggal</div>
                <div className="font-medium">{formatDate(booking.date || booking.booking_date)}</div>
              </div>
            </div>
            
            <div className="flex items-start border-b pb-2">
              <div className="w-8 h-8 flex-shrink-0 rounded-full bg-purple-50 flex items-center justify-center mr-3">
                <FaClock className="text-purple-500" size={14} />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500">Waktu</div>
                <div className="font-medium">
                  {(booking.startTime || booking.start_time || '-')} - {(booking.endTime || booking.end_time || '-')}
                </div>
                <div className="text-xs text-gray-500">
                  Durasi: {booking.duration || '1'} jam
                </div>
              </div>
            </div>
            
            <div className="flex items-start border-b pb-2">
              <div className="w-8 h-8 flex-shrink-0 rounded-full bg-red-50 flex items-center justify-center mr-3">
                <FaCreditCard className="text-red-500" size={14} />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500">Metode Pembayaran</div>
                <div className="font-medium">{booking.paymentMethod || booking.payment_method || '-'}</div>
              </div>
            </div>
            
            <div className="flex items-start border-b pb-2">
              <div className="w-8 h-8 flex-shrink-0 rounded-full bg-teal-50 flex items-center justify-center mr-3">
                <FaMoneyBillWave className="text-teal-500" size={14} />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500">Rincian Biaya</div>
                <div className="font-medium">
                  {formatCurrency(booking.totalPrice || booking.total_amount || booking.final_total_amount || 0)}
                </div>
                {(booking.discount_amount > 0 || booking.voucher) && (
                  <div className="text-xs text-green-600">
                    Diskon: {formatCurrency(booking.discount_amount || 0)}
                    {booking.voucher && ` (${booking.voucher.code})`}
                  </div>
                )}
              </div>
            </div>
            
            {(booking.notes || booking.special_requests) && (
              <div className="flex items-start">
                <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gray-50 flex items-center justify-center mr-3">
                  <FaStickyNote className="text-gray-500" size={14} />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500">Catatan</div>
                  <div className="text-sm">{booking.notes || booking.special_requests || '-'}</div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 flex justify-end gap-2">
          <button 
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            onClick={onClose}
          >
            Tutup
          </button>
          
          {booking.status === 'pending' && (
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Konfirmasi
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetailModal;
