// src/pages/pemesanan/PaymentDetail.jsx
import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoArrowBack, IoTicketOutline, IoChevronForward } from "react-icons/io5";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { PaymentContext } from "../../context/PaymentContext";
import { useVoucher } from "../../context/voucher-context";
import BookingService from "../../services/bookingService";
import SSEClient from "../../services/sseService";
import danaLogo from '/dana2.png';
import ovoLogo from '/ovo.png';
import gopayLogo from '/gopay.png';

export default function PaymentDetail() {
  const navigate = useNavigate();
  const { id } = useParams(); // invoiceNumber from URL
  const { methods } = useContext(PaymentContext);
  const { userVouchers } = useVoucher();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(900);
  const [expanded, setExpanded] = useState(false);
  const [method, setMethod] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [showVoucherList, setShowVoucherList] = useState(false);
  const [appliedDiscountAmount, setAppliedDiscountAmount] = useState(0);

  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      setError(null);
      setBooking(null); 
      setSelectedVoucher(null); // Reset voucher on new booking load
      setAppliedDiscountAmount(0); // Reset discount on new booking load

      if (!id) {
        console.error("Booking ID (invoiceNumber) is missing from URL params.");
        setError("Detail pemesanan tidak ditemukan (ID tidak valid).");
        setLoading(false);
        setTimeLeft(0);
        return;
      }

      try {
        const data = await BookingService.getBookingById(id);
        if (data && Object.keys(data).length > 0) {
          setBooking(data);
          // Initialize discount if booking data has a pre-applied discount
          // For now, we assume voucher selection overrides any backend discount for simplicity on this page
          // If booking.discount should be a base discount, this logic would need adjustment
          // setAppliedDiscountAmount(data.discount || 0); 

          if (data.expiryTime) {
            const now = new Date();
            const expiry = new Date(data.expiryTime);
            const diffInSeconds = Math.max(0, Math.floor((expiry - now) / 1000));
            setTimeLeft(diffInSeconds);
          } else {
            console.warn(`Booking data for ID ${id} is missing expiryTime. Using default timer.`);
            setTimeLeft(900); 
          }
        } else {
          console.error(`Fetched booking data is empty or invalid for ID: ${id}`);
          setError(`Detail pemesanan untuk ID ${id} tidak ditemukan.`);
          setTimeLeft(0); 
        }
      } catch (err) {
        console.error(`Error fetching booking details for ID: ${id}`, err);
        const errorMessage = err.response?.data?.message || err.message || "Gagal memuat detail pemesanan. Silakan coba lagi.";
        setError(errorMessage);
        setTimeLeft(0); 
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  useEffect(() => {
    if (booking && booking.totalPrice != null) {
      let discountCalc = 0;
      if (selectedVoucher) {
        const basePriceForDiscount = booking.totalPrice; // Or booking.price_per_hour * number_of_slots if more granular
        if (selectedVoucher.discountType === 'percentage') {
          discountCalc = Math.min(
            (basePriceForDiscount * selectedVoucher.discountValue) / 100,
            selectedVoucher.maxDiscount || Infinity
          );
        } else { // fixed amount
          discountCalc = selectedVoucher.discountValue;
        }
        // Ensure discount doesn't exceed total price
        discountCalc = Math.min(discountCalc, basePriceForDiscount);
      }
      setAppliedDiscountAmount(discountCalc);
    } else {
      // Reset discount if booking data is not ready or price is null
      // This handles the case where booking is reset during fetchBooking
      setAppliedDiscountAmount(0);
    }
  }, [selectedVoucher, booking]);


  useEffect(() => {
    if (loading || error || !booking) {
      if (error && timeLeft > 0) { // If an error occurs, ensure timer is stopped.
        setTimeLeft(0);
      }
      return; // Don't run timer if still loading, error, or no booking
    }

    if (timeLeft <= 0) {
      if (booking.id && !window.location.pathname.includes(`/transaksi/failed/${booking.id}`)) {
        console.log(`Timer expired for booking ${booking.id}. Navigating to failed transaction page.`);
        navigate(`/transaksi/failed/${booking.id}`);
      } else if (!booking.id) {
        console.warn("Timer expired, but booking ID is invalid. Cannot navigate to specific failed transaction page.");
        // Consider navigating to a generic error page or bookings list
        // if (!window.location.pathname.includes("/pemesanan")) navigate("/pemesanan");
      }
      return;
    }

    const timerInterval = setInterval(() => {
      setTimeLeft(prevTime => Math.max(0, prevTime - 1));
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [timeLeft, booking, navigate, loading, error]);

  // SSE real-time update for payment status
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !id) return;
    const sse = new SSEClient(token);
    const unsub = sse.subscribe((event) => {
      if ((event.type === "BOOKING_UPDATED" || event.type === "BOOKING_EXPIRED") && event.payload.invoiceNumber === id) {
        setBooking((prev) => prev ? { ...prev, status: event.payload.status, paymentStatus: event.payload.paymentStatus } : prev);
      }
    });
    return () => {
      unsub();
      sse.close();
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] px-4 pt-6 pb-32 font-jakarta">
        <div className="flex items-center mb-4">
          <button onClick={() => navigate(-1)} className="p-2 text-gray-600">
            <IoArrowBack size={24} />
          </button>
          <h1 className="flex-1 text-center text-xl font-bold">Detail Pembayaran</h1>
          <div className="w-6" />
        </div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center" role="alert">
          <strong className="font-bold">Terjadi Kesalahan</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] px-4 pt-6 pb-32 font-jakarta">
        <div className="flex items-center mb-4">
          <button onClick={() => navigate(-1)} className="p-2 text-gray-600">
            <IoArrowBack size={24} />
          </button>
          <h1 className="flex-1 text-center text-xl font-bold">Detail Pembayaran</h1>
          <div className="w-6" />
        </div>
        <div className="text-center py-10 text-gray-500">
          <p>Detail pemesanan tidak dapat dimuat.</p>
        </div>
      </div>
    );
  }

  // Calculations now assume `booking` is loaded and valid
  const price = booking.totalPrice || booking.total_price || 0;
  const serviceFee = booking.serviceFee != null ? booking.serviceFee : 5000;
  // const discount = booking.discount || 0; // This is now handled by appliedDiscountAmount
  const finalTotalAmount = price + serviceFee - appliedDiscountAmount;


  return (
    <div className="min-h-screen bg-[#F9FAFB] px-4 pt-6 pb-32 font-jakarta">
      {/* Header */}
      <div className="flex items-center mb-4">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-600">
          <IoArrowBack size={24} />
        </button>
        <h1 className="flex-1 text-center text-xl font-bold">
          Detail Pembayaran
        </h1>
        <div className="w-6" />
      </div>

      {/* Timer */}
      {timeLeft > 0 && (
        <div className="bg-red-100 text-red-700 text-xs rounded-lg p-3 mb-4">
          Periksa transaksi dan bayar dalam{" "}
          <span className="font-medium">{`${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`}</span>
        </div>
      )}
      {timeLeft <= 0 && !error && ( // Show expired message if timer ran out and no other error shown
         <div className="bg-red-100 text-red-700 text-xs rounded-lg p-3 mb-4">
           Waktu pembayaran telah habis.
         </div>
      )}
      <hr className="border-gray-300 mb-4" />

      {/* ID Transaksi */}
      <div className="bg-white rounded-xl shadow px-4 py-3 mb-4">
        <div className="text-xs text-gray-600 mb-1">ID Transaksi:</div>
        <div className="text-sm font-semibold">{booking?.id || 'N/A'}</div> {/* MODIFIED: Added fallback */}
      </div>

      {/* Ringkasan Booking */}
      <div className="bg-white rounded-xl shadow px-4 py-3 mb-4">
        <div className="flex justify-between">
          <div>
            <div className="text-sm font-semibold">{booking?.arenaName || 'Nama Arena Tidak Tersedia'}</div> {/* MODIFIED: Added fallback */}
            <div className="text-xs text-gray-600">
              {booking?.formattedDate || booking?.date || 'Tanggal Tidak Tersedia'} | {booking?.time || 'Waktu Tidak Tersedia'} {/* MODIFIED: Added fallbacks */}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {booking?.courtName || "Info Lapangan Tidak Tersedia"} {/* MODIFIED: Added fallback */}
            </div>
          </div>
          <div className="text-sm font-semibold">
            Rp{price.toLocaleString('id-ID')}
          </div>
        </div>
      </div>
      <hr className="border-gray-300 mb-4" />

      {/* Ringkasan Pemesanan */}
      <div className="bg-white rounded-xl shadow px-4 py-4 mb-4 space-y-2">
        <div className="text-sm font-semibold">Ringkasan Pemesanan</div>
        {[
          ["Metode Pembayaran",  method?.name  ?? "–"],
          ["Pilihan Pembayaran", method       ? "Pembayaran Penuh" : "–"],
          ["Total Harga",        `Rp${price.toLocaleString('id-ID')}`],
          ["Promo",              appliedDiscountAmount > 0 ? `-Rp${appliedDiscountAmount.toLocaleString('id-ID')}` : "Rp0"],
          ["Biaya Layanan",      `Rp${serviceFee.toLocaleString('id-ID')}`],
          ["Total Pembayaran",   `Rp${finalTotalAmount.toLocaleString('id-ID')}`],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between text-xs text-gray-700">
            <span>{label}</span>
            <span className={
              label === "Total Pembayaran"
                ? "font-semibold text-sporta-blue"
                : label === "Promo" && appliedDiscountAmount > 0
                  ? "text-green-600 font-medium"
                  : ""
            }>
              {value}
            </span>
          </div>
        ))}

        {/* Voucher Button */}
        <div className="pt-2">
          <button
            onClick={() => setShowVoucherList(!showVoucherList)}
            className={`w-full flex justify-between items-center py-2 px-3 ${selectedVoucher ? 'bg-green-50 border border-green-200' : 'bg-gray-100'} rounded-lg text-sm`}
          >
            <div className="flex items-center gap-2">
              <IoTicketOutline size={18} className={selectedVoucher ? 'text-green-600' : 'text-sporta-blue'} />
              <span>{selectedVoucher ? `${selectedVoucher.title} (${selectedVoucher.discountType === 'percentage' ? `${selectedVoucher.discountValue}%` : `Rp${selectedVoucher.discountValue.toLocaleString('id-ID')}`})` : 'Gunakan Voucher'}</span>
            </div>
            <IoChevronForward size={18} className="text-gray-400" />
          </button>

          {/* Voucher List - Assuming voucher logic remains largely the same but discount application needs review */}
          {showVoucherList && (
            <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
              {userVouchers.filter(v => !v.isUsed).length === 0 ? ( // Filter for unused vouchers
                <div className="p-4 text-center text-sm text-gray-500">
                  <IoTicketOutline size={24} className="mx-auto mb-2 text-gray-400" />
                  <p>Anda belum memiliki voucher yang dapat digunakan.</p>
                  <button
                    onClick={() => navigate("/voucher")} // Navigate to voucher discovery page
                    className="mt-2 px-4 py-1 bg-sporta-blue text-white rounded-full text-xs font-medium hover:bg-blue-700 transition-colors"
                  >
                    Lihat Voucher
                  </button>
                </div>
              ) : (
                <>
                  {selectedVoucher && (
                    <button
                      onClick={() => {
                        setSelectedVoucher(null); // This will trigger the useEffect to reset appliedDiscountAmount
                        setShowVoucherList(false);
                      }}
                      className="w-full p-3 text-left border-b border-gray-200 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      <span className="text-sm text-red-600 font-medium">Hapus Voucher Terpilih</span>
                    </button>
                  )}
                  {userVouchers.filter(v => !v.isUsed).map(voucher => {
                    // Eligibility check for voucher (example: minPurchase)
                    // This logic might need to be more sophisticated based on voucher conditions
                    const isEligible = booking.totalPrice >= (voucher.minPurchase || 0);
                    let potentialDiscount = 0;
                    if (isEligible) {
                        if (voucher.discountType === 'percentage') {
                            potentialDiscount = Math.min(
                                (booking.totalPrice * voucher.discountValue) / 100,
                                voucher.maxDiscount || Infinity
                            );
                        } else { // fixed amount
                            potentialDiscount = voucher.discountValue;
                        }
                    }

                    return (
                      <button
                        key={voucher.id}
                        onClick={() => {
                          if (isEligible) {
                            setSelectedVoucher(voucher); // This will trigger the useEffect to calculate and set appliedDiscountAmount
                            setShowVoucherList(false);
                        }
                        }}
                        disabled={!isEligible}
                        className={`w-full p-3 text-left border-b border-gray-200 ${
                          !isEligible
                            ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                            : selectedVoucher?.id === voucher.id
                              ? 'bg-green-50'
                              : 'hover:bg-gray-50'
                        } transition-colors`}
                      >
                        <div className="font-medium text-sm">{voucher.title}</div>
                        <div className="text-xs text-gray-500">
                          {voucher.description || (voucher.discountType === 'percentage'
                            ? `Diskon ${voucher.discountValue}%${voucher.maxDiscount ? ` hingga Rp${voucher.maxDiscount.toLocaleString('id-ID')}` : ''}`
                            : `Diskon Rp${voucher.discountValue.toLocaleString('id-ID')}`)}
                        </div>
                        {!isEligible && voucher.minPurchase > 0 && (
                          <div className="text-xs text-red-500 mt-1">
                            Minimal pembelian Rp{voucher.minPurchase.toLocaleString('id-ID')}
                          </div>
                        )}
                         {isEligible && potentialDiscount > 0 && (
                            <div className="text-xs text-green-600 font-medium mt-1">
                                Potensi diskon: Rp{potentialDiscount.toLocaleString('id-ID')}
                            </div>
                        )}
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <hr className="border-gray-300 mb-4" />

      {/* Pilih Metode Pembayaran */}
      <div className="bg-white rounded-xl shadow mb-28">
        <button
          className="w-full flex justify-between items-center px-4 py-3 text-sm"
          onClick={() => setExpanded(v => !v)}
        >
          {method && (() => {
              const showDana = method.type === 'E-Wallet' && method.name === 'DANA';
              const showOvo = method.type === 'E-Wallet' && method.name === 'OVO';
              const showGopay = method.type === 'E-Wallet' && method.name === 'GoPay';
              if (method.type !== 'E-Wallet') {
                console.warn(`[Selected Method Display] Selected method ('${method.name}') is not an E-Wallet. Type: ${method.type}`);
              }
              if (method.type === 'E-Wallet' && !['DANA', 'OVO', 'GoPay'].includes(method.name)) {
                console.warn(`[Selected Method Display] Selected method ('${method.name}') is an E-Wallet but not DANA, OVO, or GoPay.`);
              }

              return (
                <div className="flex items-center text-left">
                  {showDana && <img src={danaLogo} alt="DANA" className="h-6 w-6 object-contain rounded-md mr-3"/>}
                  {showOvo && <img src={ovoLogo} alt="OVO" className="h-6 w-6 object-contain rounded-md mr-3"/>}
                  {showGopay && <img src={gopayLogo} alt="GoPay" className="h-6 w-6 object-contain rounded-md mr-3"/>}
                  <div>
                    <span className="font-medium text-gray-800">{method.name}</span>
                    <span className="text-xs text-gray-500 ml-1.5">({`Saldo: Rp${method.balance.toLocaleString('id-ID')}`})</span>
                  </div>
                </div>
              );
          })()}
          {!method && <span className="font-medium text-gray-700">Pilih Metode Pembayaran</span>}
          {expanded ? <FiChevronUp className="text-gray-500" /> : <FiChevronDown className="text-gray-500" />}
        </button>
        {expanded && (
          <div className="border-t border-gray-200">
            {(methods || []).map((m, index) => {
              const isDana = m.type === 'E-Wallet' && m.name === 'DANA';
              const isOvo = m.type === 'E-Wallet' && m.name === 'OVO';
              const isGopay = m.type === 'E-Wallet' && m.name === 'GoPay';

              return (
                <div
                  key={m.id}
                  onClick={() => {
                    setMethod(m);
                    setExpanded(false);
                  }}
                  className={`flex items-center px-4 py-3.5 hover:bg-slate-100 cursor-pointer transition-colors duration-150 ease-in-out ${index === (methods || []).length - 1 ? '' : 'border-b border-slate-100'}`}
                >
                  {isDana && <img src={danaLogo} alt={`${m.name} Logo`} className="h-6 w-6 object-contain rounded-md mr-3"/>}
                  {isOvo && <img src={ovoLogo} alt={`${m.name} Logo`} className="h-6 w-6 object-contain rounded-md mr-3"/>}
                  {isGopay && <img src={gopayLogo} alt={`${m.name} Logo`} className="h-6 w-6 object-contain rounded-md mr-3"/>}
                  <div className="flex-grow">
                    <div className="text-sm font-medium text-gray-800">{m.name}</div>
                    <div className="text-xs text-gray-500">Saldo: Rp{m.balance.toLocaleString('id-ID')}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 shadow-top-md">
        <div className="max-w-[434px] mx-auto flex justify-between items-center">
          <div>
            <div className="text-xs text-gray-600">Rincian Pembayaran</div>
            <div className="text-lg font-bold text-sporta-blue">Rp{finalTotalAmount.toLocaleString('id-ID')}</div>
          </div>
          <button
            onClick={() => {
              if (!method) {
                alert("Silakan pilih metode pembayaran terlebih dahulu.");
                return;
              }
              if (!booking || !booking.id || error) {
                  alert("Data pemesanan tidak lengkap atau terdapat kesalahan. Tidak dapat melanjutkan.");
                  return;
              }
              const paymentConfirmationData = {
                bookingId: booking.id,
                arenaName: booking.arenaName,
                venueSubtitle: booking.venueSubtitle,
                formattedDate: booking.formattedDate || booking.date,
                time: booking.time,
                courtName: booking.courtName,
                activity: booking.activity,
                
                price: price, 
                serviceFee: serviceFee,
                appliedVoucher: selectedVoucher ? { 
                    id: selectedVoucher.id,
                    title: selectedVoucher.title,
                    kode_voucher: selectedVoucher.kode_voucher, // Added kode_voucher
                    discountAmount: appliedDiscountAmount 
                } : null,
                discount: appliedDiscountAmount, 
                finalTotalAmount: finalTotalAmount, 
                
                selectedPaymentMethod: method,
              };
              console.log("Navigating to PaymentConfirmation with state:", paymentConfirmationData);
              navigate('/payment-confirmation', { state: paymentConfirmationData });
            }}
            disabled={!method || !booking || loading || error || timeLeft <= 0}
            className="bg-sporta-blue hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
}
