// src/pages/pemesanan/LapanganBooking.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoArrowBack, IoCalendarOutline } from "react-icons/io5";
import { format } from "date-fns";
import { ArenaService } from "../../services/apiService";
import BookingService from "../../services/bookingService";
import TransactionService from "../../services/transactionService";
import SSEClient from "../../services/sseService";

// Fix: define generateDates, generateTimes, UNAVAILABLE_SLOTS, DEFAULT_PRICE_PER_HOUR if not already defined
const DAYS_AHEAD = 30;
const DEFAULT_PRICE_PER_HOUR = 80000;
const UNAVAILABLE_SLOTS = ["01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "24:00"];
const generateDates = () => {
  const today = new Date();
  return Array.from({ length: DAYS_AHEAD }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
};
const generateTimes = () =>
  Array.from({ length: 24 }).map((_, i) => {
    const hh = String(i + 1).padStart(2, "0");
    return `${hh}:00`;
  });

// Integrasi SSE real-time booking update
export default function LapanganBooking() {
  const navigate = useNavigate();
  const { id } = useParams();

  const dates = generateDates();

  // State untuk UI
  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [showNativePicker, setShowNativePicker] = useState(false);
  const [selectedLapangan, setSelectedLapangan] = useState("Lapangan 1");
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);

  // State untuk data dari backend
  const [arenaData, setArenaData] = useState(null);

  // State untuk data booking dan transaksi
  const [bookingHistory, setBookingHistory] = useState([]);

  // State untuk error
  const [fetchError, setFetchError] = useState("");
  const [bookingError, setBookingError] = useState("");

  // State untuk data court yang dipilih
  const [courts, setCourts] = useState([]);
  const [selectedCourtId, setSelectedCourtId] = useState(null);
  const [loading, setLoading] = useState(true); // Added general loading state

  // Ambil user dari localStorage (atau context jika ada)
  let user = null;
  let userId = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
    userId = user && user.id ? user.id : null;
    if (!userId) {
      console.warn('User object from localStorage:', user);
    }
  } catch (e) {
    console.error('Error parsing user from localStorage:', e);
    userId = null;
  }

  // Validasi userId and initial data fetch coordination
  useEffect(() => {
    if (!userId) {
      setFetchError("Sesi login Anda habis atau user tidak ditemukan. Silakan login ulang.");
      setLoading(false); // Stop loading if no user
      setTimeout(() => {
        navigate("/login"); // Use navigate for internal routing
      }, 2000);
      return; // Prevent further execution in this effect
    }
    // Set loading true when starting to fetch, if userId is present
    setLoading(true);
  }, [userId, navigate]);

  // Fetch arena data
  useEffect(() => {
    if (!userId) return; // Don't fetch if no userId
    const fetchArenaData = async () => {
      try {
        // setLoading(true); // setLoading is handled by the userId effect or at the start of combined fetches
        const data = await ArenaService.getArenaById(id);
        setArenaData(data);
        // Courts will be fetched in the next effect, loading will be managed there or globally
      } catch (error) {
        console.error("Error fetching arena data:", error);
        setFetchError("Gagal mengambil data arena.");
        setLoading(false); // Set loading false on error here if this is the only/final fetch in this chain
      }
    };

    if (id) fetchArenaData();
  }, [id, userId]);

  // Fetch courts data
  useEffect(() => {
    if (!userId || !id) return; // Don't fetch if no userId or arena id
    const fetchCourts = async () => {
      try {
        // setLoading(true); // setLoading is managed more globally
        const courtsData = await ArenaService.getCourtsByArenaId(id);
        setCourts(courtsData);
        if (courtsData.length > 0) {
          setSelectedCourtId(courtsData[0].id);
          setSelectedLapangan(courtsData[0].name);
        }
      } catch (error) {
        console.error("Error fetching courts data:", error);
        setFetchError("Gagal mengambil data lapangan.");
      } finally {
        // This finally block might be too early if other fetches depend on courtsData
        // setLoading(false); // Consider moving to a Promise.all or a final useEffect
      }
    };
    fetchCourts();
  }, [id, userId]);

  // Fetch booking history & transactions from backend
  useEffect(() => {
    if (!userId || !selectedDate || !selectedLapangan) return; // Ensure all dependencies are available

    const fetchData = async () => {
      try {
        setFetchError("");
        setLoading(true); // Keep loading true here
        const history = await BookingService.getUserBookings(userId);

        if (!Array.isArray(history)) {
          setFetchError("Data booking tidak valid.");
          setBookingHistory([]);
        } else {
          setBookingHistory(history);
        }
      } catch (error) {
        console.error("Error fetching booking/transaction data:", error);
        setFetchError(error.message || "Gagal mengambil data booking/riwayat transaksi.");
        setBookingHistory([]);
      } finally {
        setLoading(false); // Set loading to false after all data is fetched or an error occurs
      }
    };
    fetchData();
  }, [selectedDate, selectedLapangan, userId]);

  // Update booked slots when selected date or lapangan changes
  useEffect(() => {
    if (!selectedCourtId || !selectedDate) {
      setBookedSlots([]);
      return;
    }

    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    const combinedBookedSlots = new Set();

    bookingHistory.forEach(booking => {
      if (booking.booking_date === formattedDate &&
          booking.court_name === selectedLapangan &&
          (booking.status === 'pending' || booking.status === 'confirmed' || booking.status === 'completed') && booking.status !== 'expired') {
        if (booking.time_slots_details) {
          try {
            const slotsArray = JSON.parse(booking.time_slots_details);
            if (Array.isArray(slotsArray)) {
              slotsArray.forEach(slot => combinedBookedSlots.add(slot));
            }
          } catch (e) { console.error("Error parsing time_slots_details from bookingHistory:", e); }
        }
      }
    });

    let isMounted = true;
    const fetchAndSetInitialSlots = async () => {
      try {
        setLoading(true);
        const serverSlots = await BookingService.getAvailableSlots(selectedCourtId, formattedDate);
        if (isMounted) {
          serverSlots.forEach(slotInfo => {
            if (slotInfo.status === 'booked') {
              combinedBookedSlots.add(slotInfo.time);
            }
          });
          const finalBookedSlots = Array.from(combinedBookedSlots);
          setBookedSlots(finalBookedSlots);
          setSelectedTimes(prev => prev.filter(time => !finalBookedSlots.includes(time)));
        }
      } catch (error) {
        console.error("Error fetching initial available slots:", error);
        if (isMounted) {
          const finalBookedSlots = Array.from(combinedBookedSlots);
          setBookedSlots(finalBookedSlots);
          setSelectedTimes(prev => prev.filter(time => !finalBookedSlots.includes(time)));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAndSetInitialSlots();

    return () => {
      isMounted = false;
    };
  }, [selectedDate, selectedLapangan, selectedCourtId, bookingHistory]);

  // Update selectedCourtId jika user pilih lapangan
  useEffect(() => {
    const court = courts.find(c => c.name === selectedLapangan);
    if (court) setSelectedCourtId(court.id);
  }, [selectedLapangan, courts]);

  const toggleNative = () => setShowNativePicker(v => !v);

  const onTimeClick = t => {
    if (bookedSlots.includes(t) || UNAVAILABLE_SLOTS.includes(t)) return;
    setSelectedTimes(prev =>
      prev.includes(t)
        ? prev.filter(x => x !== t)
        : [...prev, t]
    );
  };

  // Kalkulasi harga realtime
  const pricePerHour = courts.find(c => c.id === selectedCourtId)?.price_per_hour || arenaData?.price_per_hour || DEFAULT_PRICE_PER_HOUR;
  const totalPrice = pricePerHour * selectedTimes.length;

  const handleContinue = async () => {
    try {
      setBookingError("");
      if (!userId) throw new Error("Sesi login Anda habis. Silakan login ulang.");
      if (!selectedCourtId) throw new Error("Lapangan tidak valid atau belum dipilih.");
      if (selectedTimes.length === 0) throw new Error("Pilih minimal satu slot waktu.");

      // Hitung start_time dan end_time
      const sortedTimes = [...selectedTimes].sort();
      const startTime = sortedTimes[0];
      // Ambil jam dari endTime, tambahkan 1 jam
      let endHour = parseInt(sortedTimes[sortedTimes.length - 1].split(":")[0], 10) + 1;
      if (endHour < 10) endHour = `0${endHour}`;
      if (endHour > 23) endHour = 23; // Batas maksimal 23:00
      const endTime = `${endHour}:00`;

      const bookingPayload = {
        courtId: selectedCourtId,
        date: format(selectedDate, "yyyy-MM-dd"),
        timeSlots: sortedTimes,
        start_time: startTime,
        end_time: endTime,
        totalPriceFromFrontend: totalPrice,
        serviceFeeFromFrontend: 5000, // atau ambil dari state jika ada fitur biaya layanan dinamis
        discountFromFrontend: 0, // atau ambil dari voucher jika ada
        finalTotalFromFrontend: totalPrice + 5000 // - diskon jika ada
      };
      
      const newBooking = await BookingService.createBooking(bookingPayload);

      if (newBooking && newBooking.invoiceNumber) {
        navigate(`/payment-detail/${newBooking.invoiceNumber}`);
      } else {
        // Handle case where booking creation was successful but invoiceNumber is missing
        throw new Error("Gagal membuat booking: Nomor invoice tidak ditemukan.");
      }

    } catch (err) {
      setBookingError(err.message || "Terjadi kesalahan saat booking.");
    }
  };

  // Integrasi SSE real-time booking update
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const sse = new SSEClient(token);

    const unsub = sse.subscribe((event) => {
      console.log("SSE Event Received:", event); // For debugging

      if (event.type === "SLOT_AVAILABILITY_UPDATED") {
        const { courtId: eventCourtId, date: eventDate, timeSlots: eventTimeSlots, availability } = event.payload;
        const formattedSelectedDate = format(selectedDate, "yyyy-MM-dd");

        // Ensure selectedCourtId is a string for comparison if eventCourtId is a number, or vice-versa
        if (String(selectedCourtId) === String(eventCourtId) && formattedSelectedDate === eventDate) {
          console.log("Relevant SSE Event for Slot Availability:", event.payload); // For debugging
          if (availability === 'booked' || availability === 'pending_payment') {
            setBookedSlots(prevBookedSlots => {
              const newBookedSlots = new Set([...prevBookedSlots, ...eventTimeSlots]);
              return Array.from(newBookedSlots);
            });
            setSelectedTimes(prevSelectedTimes =>
              prevSelectedTimes.filter(time => !eventTimeSlots.includes(time))
            );
          } else if (availability === 'available') {
            setBookedSlots(prevBookedSlots =>
              prevBookedSlots.filter(slot => !eventTimeSlots.includes(slot))
            );
          }
        }
      } else if (event.type === "BOOKING_UPDATED" || event.type === "BOOKING_EXPIRED") {
        console.log("Relevant SSE Event for Booking/Transaction History:", event.payload);
        const { invoiceNumber, status, paymentStatus, id: eventBookingId } = event.payload;
        // Update bookingHistory for the current user's list
        setBookingHistory((prevHistory) =>
          prevHistory.map((b) =>
            (b.invoice_number === invoiceNumber || b.id === invoiceNumber || b.id === eventBookingId)
              ? { ...b, status: status, paymentStatus: paymentStatus }
              : b
          )
        );
      }
    });

    return () => {
      unsub();
      sse.close();
    };
  }, [selectedDate, selectedCourtId, userId]); // Added selectedDate, selectedCourtId, userId

  console.log('Price details in booking:', {
    pricePerHour,
    totalPrice,
    arenaPrice: arenaData?.price_per_hour,
    selectedTimesCount: selectedTimes.length
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-jakarta">
      {/* Error fetch data */}
      {fetchError && (
        <div className="bg-red-100 text-red-700 px-4 py-2 text-center font-semibold fixed top-0 left-0 right-0 z-50">{fetchError}</div>
      )}
      {/* Error booking */}
      {bookingError && (
        <div className="bg-red-100 text-red-700 px-4 py-2 text-center font-semibold fixed top-10 left-0 right-0 z-50">{bookingError}</div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-40">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        </div>
      )}

      {/* Header Fixed */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-white shadow-md">
        <div className="max-w-md mx-auto flex items-center h-16 px-4">
          <button
            onClick={() => navigate(`/arena/${id}`)}
            className="p-2 text-gray-600"
          >
            <IoArrowBack size={24} />
          </button>
          <h1 className="flex-1 text-center text-xl font-bold">
            Pilih Tanggal & Jam
          </h1>
          <button onClick={toggleNative} className="p-2 text-gray-600">
            <IoCalendarOutline size={24} />
          </button>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-md mx-auto pt-20 px-4 pb-32">
        {/* Native date picker */}
        {showNativePicker && (
          <input
            type="date"
            className="absolute top-16 left-1/2 transform -translate-x-1/2 z-30 bg-white rounded shadow p-2"
            onChange={e => {
              const d = new Date(e.target.value);
              if (!isNaN(d)) setSelectedDate(d);
              setShowNativePicker(false);
            }}
          />
        )}

        {/* Tanggal */}
        <h3 className="text-lg font-bold mb-2">Tanggal</h3>
        <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar">
          {dates.map(d => {
            const isSelected = d.toDateString() === selectedDate.toDateString();
            return (
              <button
                key={d.toISOString()}
                onClick={() => setSelectedDate(d)}
                className={`
                  flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium
                  shadow-sm border
                  ${isSelected
                    ? "bg-blue-500 text-white border-blue-600"
                    : "bg-gray-100 text-gray-700 border-gray-200"}
                `}
              >
                <div>{format(d, "d MMM")}</div>
                <div className="text-xs">{format(d, "EEE")}</div>
              </button>
            );
          })}
        </div>

        {/* Separator */}
        <div className="border-t border-gray-200 my-6" />

        {/* Pilih Lapangan */}
        <h3 className="text-lg font-bold mb-2">Lapangan</h3>
        <div className="flex gap-2 py-2 overflow-x-auto no-scrollbar">
          {courts.map(lap => (
            <button
              key={lap.id}
              onClick={() => setSelectedLapangan(lap.name)}
              className={
                `flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium border ` +
                (selectedLapangan === lap.name
                  ? "bg-blue-500 text-white border-blue-600"
                  : "bg-gray-100 text-gray-700 border-gray-200")
              }
            >
              {lap.name}
            </button>
          ))}
        </div>

        {/* Separator */}
        <div className="border-t border-gray-200 my-6" />

        {/* Grid Jam */}
        <h3 className="text-lg font-bold mb-3">Jam</h3>
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {generateTimes().map(t => {
            const booked = bookedSlots.includes(t);
            const unavailable = UNAVAILABLE_SLOTS.includes(t);
            const selected = selectedTimes.includes(t);

            let baseClass;
            if (unavailable) {
              baseClass = "bg-gray-100 text-gray-300 cursor-not-allowed";
            } else if (booked) {
              baseClass = "bg-red-500 text-white font-bold shadow";
            } else if (selected) {
              baseClass = "bg-green-500 text-white font-bold shadow";
            } else {
              baseClass = "bg-gray-50 text-gray-700 hover:bg-blue-50";
            }

            return (
              <button
                key={t}
                onClick={() => onTimeClick(t)}
                disabled={unavailable || booked}
                className={`flex flex-col items-center justify-center px-1 py-2 sm:px-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm h-[48px] sm:h-[54px] border ${baseClass}`}
                style={{ boxShadow: unavailable ? "none" : "0 1px 6px rgba(30,64,175,0.06)" }}
              >
                <span className="font-semibold">{t}</span>
                {!booked && !unavailable && (
                  <span className="text-[9px] sm:text-[10px]">
                    {(pricePerHour / 1000).toFixed(0)}K
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Status Keterangan */}
        <div className="flex flex-wrap items-center gap-6 text-xs text-gray-600 py-4 mt-3">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-gray-100 border border-gray-300 rounded-full inline-block" /> Tersedia
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-500 border border-green-600 rounded-full inline-block" /> Dipilih
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-500 border border-red-600 rounded-full inline-block" /> Sudah Dibooking
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-gray-200 my-6" />

        {/* Total Harga */}
        <div className="flex items-center justify-between py-2 mb-4">
          <div className="text-sm">Total Harga</div>
          <div className="text-xl font-bold tracking-tight">
            Rp{totalPrice.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white shadow-xl py-4">
        <div className="max-w-md mx-auto px-4">
          <button
            onClick={handleContinue}
            disabled={selectedTimes.length === 0}
            className={`w-full py-3 rounded-xl font-bold text-lg shadow-md transition ${
              selectedTimes.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white active:bg-blue-600"
            }`}
          >
            Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
}
