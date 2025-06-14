import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useVoucher } from '../context/voucher-context';
import VoucherSelector from '../components/VoucherSelector';
import PaymentSummary from '../components/PaymentSummary';

// Ganti dengan BookingService Anda
const BookingService = {
  createBooking: async (data) => {
    console.log('Creating booking with data:', data);
    // Implementasi untuk membuat booking
    return { success: true, data: { bookingId: 'BOOK-123' } };
  }
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { useVoucher } = useVoucher();
  
  // State untuk checkout
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  
  // State untuk voucher
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  
  // Data harga (contoh, ganti dengan data sebenarnya)
  const [subtotal, setSubtotal] = useState(150000);
  const [serviceFee, setServiceFee] = useState(5000);
  
  // Cek apakah ada parameter voucher di URL
  useEffect(() => {
    const voucherId = searchParams.get('voucher');
    if (voucherId) {
      console.log('Voucher ID dari URL:', voucherId);
      // Implementasi untuk memuat voucher berdasarkan ID
    }
  }, [searchParams]);
  
  // Handler untuk saat voucher dipilih
  const handleVoucherSelected = (voucher, discount) => {
    console.log('Voucher dipilih:', voucher);
    console.log('Diskon:', discount);
    setSelectedVoucher(voucher);
    setVoucherDiscount(discount);
  };
  
  // Handler untuk saat voucher dihapus
  const handleVoucherRemoved = () => {
    console.log('Voucher dihapus');
    setSelectedVoucher(null);
    setVoucherDiscount(0);
  };
  
  // Handler untuk checkout
  const handleCheckout = async () => {
    try {
      setIsProcessing(true);
      setCheckoutError('');
      
      // Validasi data
      if (!selectedPaymentMethod) {
        setCheckoutError('Pilih metode pembayaran');
        return;
      }
      
      // Data untuk API booking
      const bookingData = {
        courtId: selectedCourt?.id,
        bookingDate: selectedDate,
        startTime: selectedTimeSlot?.startTime,
        endTime: selectedTimeSlot?.endTime,
        paymentMethod: selectedPaymentMethod,
        voucherId: selectedVoucher?.id, // Tambahkan ID voucher jika ada
        amount: subtotal + serviceFee - voucherDiscount
      };
      
      // Panggil API untuk membuat booking
      const response = await BookingService.createBooking(bookingData);
      
      // Jika berhasil dan ada voucher, tandai voucher sebagai terpakai
      if (response.success && selectedVoucher) {
        try {
          await useVoucher(selectedVoucher.id);
          console.log('Voucher berhasil digunakan');
        } catch (voucherError) {
          console.error('Error saat menggunakan voucher:', voucherError);
          // Tidak membatalkan transaksi jika gagal menandai voucher
        }
      }
      
      // Navigasi ke halaman sukses
      navigate(`/booking/success/${response.data.bookingId}`);
      
    } catch (error) {
      console.error('Error saat checkout:', error);
      setCheckoutError(error.message || 'Gagal memproses pembayaran');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      
      {checkoutError && (
        <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg">
          {checkoutError}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detail Booking */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detail lapangan dan waktu (sesuaikan dengan aplikasi Anda) */}
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold text-lg mb-4">Detail Booking</h2>
            {/* Isi dengan detail booking */}
          </div>
          
          {/* Pilih Voucher */}
          <VoucherSelector 
            subtotal={subtotal}
            onVoucherSelected={handleVoucherSelected}
            onVoucherRemoved={handleVoucherRemoved}
          />
          
          {/* Metode Pembayaran */}
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold text-lg mb-4">Metode Pembayaran</h2>
            {/* Isi dengan pilihan metode pembayaran */}
          </div>
        </div>
        
        {/* Ringkasan Pembayaran */}
        <div className="space-y-6">
          <PaymentSummary 
            subtotal={subtotal}
            voucherDiscount={voucherDiscount}
            selectedVoucher={selectedVoucher}
            serviceFee={serviceFee}
          />
          
          <button
            onClick={handleCheckout}
            disabled={isProcessing}
            className={`w-full py-3 rounded-lg text-white font-medium ${
              isProcessing 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isProcessing ? 'Memproses...' : 'Bayar Sekarang'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;