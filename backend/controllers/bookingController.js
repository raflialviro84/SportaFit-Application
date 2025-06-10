// server/controllers/bookingController.js
const Booking = require('../models/bookingModel');
const Court = require('../models/courtModel');
const Arena = require('../models/arenaModel');
const User = require('../models/userModel');
const { Voucher } = require('../models/voucherModel'); // Add this at the top if not already imported
const { Op } = require('sequelize');
const { format, isValid } = require('date-fns'); // Pastikan isValid diimpor
const { sendEventToAllClients } = require('../controllers/eventController');

// Safely load and store the locale
let effectiveLocale = null;

(async () => {
  try {
    const localeModuleImport = await import('date-fns/locale/id');
    let localeModule = localeModuleImport.default;
    if (localeModule && localeModule.default && typeof localeModule.default === 'object' && localeModule.default.code === 'id') {
        localeModule = localeModule.default;
    }
    if (localeModule && typeof localeModule === 'object' && localeModule.code === 'id' && Object.keys(localeModule).length > 0) {
      effectiveLocale = localeModule;
      console.log("Successfully loaded 'id' locale for date-fns using dynamic import.");
    } else {
      console.warn("Loaded module for 'id' locale (via dynamic import) is not a valid date-fns locale object or is empty. Date formatting will use fallbacks.");
      effectiveLocale = null;
    }
  } catch (e) {
    console.error("Error dynamically importing 'id' locale for date-fns:", e.message, ". Date formatting will use fallbacks.");
    effectiveLocale = null;
  }
})();

// Fungsi untuk menghasilkan nomor invoice
const generateInvoiceNumber = () => {
  const date = format(new Date(), 'yyMMdd');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const suffix = Math.floor(Math.random() * 90 + 10);
  return `INV-${date}-${random}-${suffix}`;
};

// Get available slots for a court on a specific date
module.exports.getAvailableSlots = async (req, res) => {
  try {
    const { courtId, date } = req.query;

    if (!courtId || !date) {
      return res.status(400).json({ message: 'Court ID and date are required' });
    }

    const court = await Court.findByPk(courtId);
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }

    const bookings = await Booking.findAll({
      where: {
        court_id: courtId,
        booking_date: date,
        status: {
          [Op.notIn]: ['cancelled', 'expired'] // Ensure expired bookings are excluded
        }
      }
    });

    const allTimeSlots = [];
    for (let hour = 8; hour <= 23; hour++) {
      const timeStr = `${String(hour).padStart(2, '0')}:00`;
      allTimeSlots.push(timeStr);
    }

    const bookedTimeSlots = new Set();
    bookings.forEach(booking => {
      if (booking.time_slots_details) {
        try {
          const slotsArray = JSON.parse(booking.time_slots_details);
          if (Array.isArray(slotsArray)) {
            slotsArray.forEach(slot => bookedTimeSlots.add(slot.split(' - ')[0])); // Add each individual slot
          }
        } catch (e) {
          console.error("Error parsing time_slots_details for getAvailableSlots: ", e);
          // Fallback to start_time if parsing fails, though ideally time_slots_details is robust
          bookedTimeSlots.add(booking.start_time.slice(0,5));
        }
      } else {
        // Fallback for older bookings or if time_slots_details is missing
        bookedTimeSlots.add(booking.start_time.slice(0,5));
      }
    });

    const slots = allTimeSlots.map(time => ({
      time,
      status: bookedTimeSlots.has(time) ? 'booked' : 'available',
      price: court.price_per_hour
    }));

    res.json(slots);
  } catch (error) {
    console.error('Error getting available slots:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get courts by arena ID with availability info
module.exports.getCourtsByArenaWithAvailability = async (req, res) => {
  try {
    const { arenaId, date } = req.query;
    
    if (!arenaId) {
      return res.status(400).json({ message: 'Arena ID is required' });
    }
    
    const courts = await Court.findAll({
      where: { arena_id: arenaId, status: 'active' },
      order: [['name', 'ASC']]
    });
    
    if (courts.length === 0) {
      return res.status(404).json({ message: 'No courts found for this arena' });
    }
    
    if (date) {
      const courtIds = courts.map(court => court.id);
      const bookings = await Booking.findAll({
        where: {
          court_id: { [Op.in]: courtIds },
          booking_date: date,
          status: { [Op.notIn]: ['cancelled', 'expired'] }
        }
      });
      
      const courtsWithAvailability = courts.map(court => {
        const courtBookings = bookings.filter(booking => booking.court_id === court.id);
        const bookedHours = courtBookings.length;
        const totalHoursInOperation = 16; 
        const availableHours = totalHoursInOperation - bookedHours;
        const availabilityPercentage = totalHoursInOperation > 0 ? Math.round((availableHours / totalHoursInOperation) * 100) : 0;
        
        return {
          ...court.toJSON(),
          availability: {
            percentage: availabilityPercentage,
            bookedHours,
            totalAvailableHours: availableHours,
            operatingHours: totalHoursInOperation
          }
        };
      });
      return res.json(courtsWithAvailability);
    }
    res.json(courts);
  } catch (error) {
    console.error('Error getting courts with availability:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create a new booking
module.exports.createBooking = async (req, res) => {
  try {
    const { courtId, date, timeSlots, activity, totalPriceFromFrontend, serviceFeeFromFrontend, discountFromFrontend, finalTotalFromFrontend } = req.body;
    const userId = req.user.id;

    const protectionFeeFromFrontend = req.body.protectionFee != null ? req.body.protectionFee : 0;

    if (!userId || !courtId || !date || !timeSlots || timeSlots.length === 0) {
      return res.status(400).json({ message: 'User ID, court ID, date, and time slots are required' });
    }
    
    const court = await Court.findByPk(courtId, {
      include: [{ model: Arena, attributes: ['id', 'name', 'category'] }]
    });
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }
    
    const bookingDate = date;
    const existingBookings = await Booking.findAll({
      where: {
        court_id: courtId,
        booking_date: bookingDate,
        start_time: { [Op.in]: timeSlots.map(slot => slot.split(' - ')[0]) },
        status: { [Op.notIn]: ['cancelled', 'expired'] }
      }
    });
    
    if (existingBookings.length > 0) {
      const bookedTimes = existingBookings.map(b => b.start_time.slice(0,5));
      return res.status(409).json({ 
        message: 'Some requested time slots are already booked or pending.',
        conflictingSlots: bookedTimes 
      });
    }
    
    const calculatedTotalPrice = timeSlots.length * court.price_per_hour;
    if (totalPriceFromFrontend != null && Math.abs(calculatedTotalPrice - totalPriceFromFrontend) > 0.01) {
        console.warn(`Price mismatch: Backend calculated ${calculatedTotalPrice}, Frontend sent ${totalPriceFromFrontend}`);
    }

    const invoiceNumber = generateInvoiceNumber();
    const expiryTime = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    let startTime, endTime;
    if (req.body.start_time && req.body.end_time) {
      startTime = req.body.start_time;
      endTime = req.body.end_time;
    } else {
      startTime = timeSlots[0].split(' - ')[0];
      endTime = timeSlots[timeSlots.length - 1].split(' - ')[1];
    }

    const newBooking = await Booking.create({
        user_id: userId,
        court_id: courtId,
        arena_id: court.arena_id,
        invoice_number: invoiceNumber,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        time_slots_details: JSON.stringify(timeSlots),
        total_price: calculatedTotalPrice,
        service_fee: serviceFeeFromFrontend == null ? 5000 : serviceFeeFromFrontend,
        discount_amount: discountFromFrontend == null ? 0 : discountFromFrontend,
        protection_fee: protectionFeeFromFrontend,
        final_total_amount: finalTotalFromFrontend == null ? (calculatedTotalPrice + (serviceFeeFromFrontend == null ? 5000 : serviceFeeFromFrontend) + protectionFeeFromFrontend - (discountFromFrontend == null ? 0 : discountFromFrontend)) : finalTotalFromFrontend,
        status: 'pending',
        payment_status: 'unpaid',
        activity: activity || court.arena?.category || 'Olahraga',
        expiry_time: expiryTime,
    });
    
    res.status(201).json({
      message: 'Booking created successfully and awaiting payment.',
      booking: newBooking,
      invoiceNumber: newBooking.invoice_number, 
      totalPrice: newBooking.total_price, 
      arenaName: court.arena?.name,
      courtName: court.name
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors.map(e => e.message) });
    }
    res.status(500).json({ message: error.message || 'Failed to create booking.' });
  }
};

// Get user's bookings (list view)
module.exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const bookings = await Booking.findAll({
      where: {
        user_id: userId,
        status: ['pending', 'expired'] // Only show pending and expired bookings
      },
      include: [
        {
          model: Court,
          as: 'court',
          attributes: ['id', 'name', 'price_per_hour'],
          include: [
            {
              model: Arena,
              as: 'arena',
              attributes: ['id', 'name', 'address', 'city', 'category', 'images']
            }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['booking_date', 'DESC'], ['start_time', 'DESC']]
    });

    if (!bookings || bookings.length === 0) {
      return res.status(200).json([]);
    }

    const formattedBookings = bookings.map(booking => {
      const bookingJson = booking.toJSON();
      let formattedBookingDate = 'Tanggal tidak tersedia';
      if (bookingJson.booking_date) {
        const parsedDate = new Date(bookingJson.booking_date);
        if (isValid(parsedDate)) {
          try {
            if (effectiveLocale) {
              formattedBookingDate = format(parsedDate, 'EEEE, dd MMMM yyyy', { locale: effectiveLocale });
            } else {
              formattedBookingDate = format(parsedDate, 'dd MMMM yyyy'); 
            }
          } catch (e) {
             try {
                formattedBookingDate = format(parsedDate, 'dd MMMM yyyy'); 
            } catch (e2) {
                try {
                    formattedBookingDate = format(parsedDate, 'yyyy-MM-dd'); 
                } catch (e3) {
                    formattedBookingDate = bookingJson.booking_date; 
                }
            }
          }
        } else {
          formattedBookingDate = bookingJson.booking_date;
        }
      }

      let arenaImages = [];
      if (bookingJson.court?.arena?.images && typeof bookingJson.court.arena.images === 'string') {
        try {
          const trimmedImages = bookingJson.court.arena.images.trim();
          if (trimmedImages.startsWith('[') || trimmedImages.startsWith('{')) {
            arenaImages = JSON.parse(trimmedImages);
          } else if (trimmedImages) {
            console.warn(`arena.images for arena ID ${bookingJson.court.arena.id} is not valid JSON: ${trimmedImages}`);
          }
        } catch (jsonError) {
          console.error(`Error parsing arena.images JSON for arena ID ${bookingJson.court.arena.id}:`, jsonError.message, `Raw data: ${bookingJson.court.arena.images}`);
        }
      }

      return {
        ...bookingJson,
        booking_date_formatted: formattedBookingDate,
        start_time_formatted: bookingJson.start_time ? bookingJson.start_time.slice(0, 5) : '--:--',
        end_time_formatted: bookingJson.end_time ? bookingJson.end_time.slice(0, 5) : '--:--',
        arena_name: bookingJson.court?.arena?.name,
        court_name: bookingJson.court?.name,
        arena_category: bookingJson.court?.arena?.category,
        arena_city: bookingJson.court?.arena?.city,
        arena_images: arenaImages 
      };
    });

    res.json(formattedBookings);
  } catch (error) {
    console.error('Error in getMyBookings:', error);
    res.status(500).json({ message: error.message || 'Failed to retrieve bookings.' });
  }
};

// Get booking details by invoice number (for PaymentDetail page)
module.exports.getBookingByInvoice = async (req, res) => {
  try {
    const { invoiceNumber } = req.params;
    if (!invoiceNumber) {
      return res.status(400).json({ message: 'Invoice number is required' });
    }
    
    const booking = await Booking.findOne({
      where: { invoice_number: invoiceNumber },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
        { 
          model: Court,
          as: 'court',
          attributes: ['id', 'name', 'price_per_hour'],
          include: [{ model: Arena, as: 'arena', attributes: ['id', 'name', 'address', 'city', 'category'] }]
        }
      ]
    });
    
    if (!booking) {
      return res.status(404).json({ message: `Booking with invoice number ${invoiceNumber} not found.` });
    }
    
    let timeSlotsArray = [];
    let timeRange = `${booking.start_time ? booking.start_time.slice(0,5) : '--:--'} - ${booking.end_time ? booking.end_time.slice(0,5) : '--:--'}`;
    if (booking.time_slots_details) {
        try {
            timeSlotsArray = JSON.parse(booking.time_slots_details);
            if (Array.isArray(timeSlotsArray) && timeSlotsArray.length > 0) {
                if (typeof timeSlotsArray[0] === 'string' && !timeSlotsArray[0].includes(' - ')) {
                    const start = timeSlotsArray[0];
                    let endHour = parseInt(timeSlotsArray[timeSlotsArray.length - 1].split(":")[0], 10) + 1;
                    if (endHour < 10) endHour = `0${endHour}`;
                    if (endHour > 23) endHour = 23; // Cap at 23:00 for end time
                    const end = `${endHour}:00`;
                    timeRange = `${start} - ${end}`;
                } else if (typeof timeSlotsArray[0] === 'string' && timeSlotsArray[0].includes(' - ')) {
                    timeRange = `${timeSlotsArray[0].split(' - ')[0]} - ${timeSlotsArray[timeSlotsArray.length - 1].split(' - ')[1]}`;
                }
            }
        } catch (e) {
            console.error("Error parsing time_slots_details for getBookingByInvoice: ", e);
            timeSlotsArray = [];
        }
    }
    if (!timeRange || timeRange.includes('undefined')) {
        timeRange = `${booking.start_time ? booking.start_time.slice(0,5) : '--:--'} - ${booking.end_time ? booking.end_time.slice(0,5) : '--:--'}`;
    }
    
    let rawBookingDate = booking.booking_date;
    let dateForDisplay = 'N/A'; 
    let formattedDateForDisplay = 'Tanggal tidak tersedia';

    if (rawBookingDate) {
        const parsedDate = new Date(rawBookingDate);
        if (isValid(parsedDate)) {
            try {
                dateForDisplay = format(parsedDate, 'yyyy-MM-dd');
            } catch (simpleFormatError) {
                dateForDisplay = rawBookingDate;
            }
            try {
              if (effectiveLocale) {
                formattedDateForDisplay = format(parsedDate, 'EEEE, dd MMMM yyyy', { locale: effectiveLocale });
              } else {
                formattedDateForDisplay = format(parsedDate, 'dd MMMM yyyy'); 
              }
            } catch (localeFormatError) {
                try {
                    formattedDateForDisplay = format(parsedDate, 'dd MMMM yyyy');
                } catch (fallbackFormatError) {
                    try {
                        formattedDateForDisplay = format(parsedDate, 'yyyy-MM-dd');
                    } catch (superFallbackError) {
                        formattedDateForDisplay = rawBookingDate; 
                    }
                }
            }
        } else {
            dateForDisplay = rawBookingDate; 
            formattedDateForDisplay = rawBookingDate;
        }
    }
    
    const rawArenaName = booking.court?.arena?.name;
    const rawCourtName = booking.court?.name;
    const rawArenaAddress = booking.court?.arena?.address;
    const rawArenaCity = booking.court?.arena?.city;

    const displayArenaName = (rawArenaName && rawArenaName !== '-') ? rawArenaName : 'Nama arena tidak tersedia';
    const displayCourtName = (rawCourtName && rawCourtName !== '-') ? rawCourtName : 'Lapangan Tidak Tersedia';

    let displayVenueSubtitle;
    if (rawArenaAddress && rawArenaAddress !== '-') {
      displayVenueSubtitle = rawArenaAddress;
    } else if (rawArenaCity && rawArenaCity !== '-') {
      displayVenueSubtitle = rawArenaCity;
    } else {
      displayVenueSubtitle = 'Detail Lokasi Tidak Tersedia';
    }

    const bookingDetails = {
      id: booking.invoice_number,
      bookingId: booking.id,
      userId: booking.user_id,
      user: booking.user, // Use 'user' (lowercase) to match the alias
      arenaName: displayArenaName,
      venueSubtitle: displayVenueSubtitle,
      courtName: displayCourtName,
      pricePerHour: booking.court?.price_per_hour || 0,
      date: dateForDisplay,
      formattedDate: formattedDateForDisplay,
      time: timeRange,
      timeSlots: timeSlotsArray,
      totalPrice: booking.total_price,
      serviceFee: booking.service_fee == null ? 5000 : booking.service_fee,
      protectionFee: booking.protection_fee == null ? 0 : booking.protection_fee,
      discount: booking.discount_amount == null ? 0 : booking.discount_amount,
      finalTotalAmount: booking.final_total_amount == null ? (booking.total_price + (booking.service_fee == null ? 5000 : booking.service_fee) + (booking.protection_fee == null ? 0 : booking.protection_fee) - (booking.discount_amount == null ? 0 : booking.discount_amount)) : booking.final_total_amount,
      status: booking.status,
      paymentStatus: booking.payment_status,
      payment_method: booking.payment_method || null, // always include raw DB value
      paymentMethod: booking.payment_method || null,  // for frontend compatibility
      activity: booking.activity || booking.court?.arena?.category || 'Olahraga',
      expiryTime: booking.expiry_time,
      // --- ADD THESE FIELDS FOR FRONTEND ---
      created_at: booking.created_at,
      updated_at: booking.updated_at,
    };
    res.json(bookingDetails);
  } catch (error) {
    console.error('Error getting booking details by invoice:', error);
    res.status(500).json({ message: error.message || 'Failed to retrieve booking details.' });
  }
};

// Update booking status (after payment attempt)
module.exports.updateBookingStatus = async (req, res) => {
  console.log("\\n--- updateBookingStatus --- C A L L E D ---");
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log("Request params:", req.params);
  console.log("Request body:", JSON.stringify(req.body, null, 2));
  console.log("User from req.user:", req.user ? { id: req.user.id, email: req.user.email } : "No user on req");

  try {
    const { invoiceNumber } = req.params;
    const userId = req.user.id; 
    const { status, paymentMethod, ...otherBodyParams } = req.body;

    console.log("Extracted invoiceNumber:", invoiceNumber);
    console.log("Extracted userId:", userId);
    console.log("Extracted status from body:", status);
    console.log("Extracted paymentMethod from body:", paymentMethod);
    console.log("Other body parameters received:", JSON.stringify(otherBodyParams, null, 2));
    
    if (!invoiceNumber) {
      return res.status(400).json({ message: 'Invoice number is required' });
    }
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated or user ID missing.' });
    }
    
    const booking = await Booking.findOne({
      where: { invoice_number: invoiceNumber, user_id: userId }
    });
    
    if (!booking) {
      return res.status(404).json({ message: `Booking ${invoiceNumber} not found or access denied.` });
    }

    if ([ 'confirmed', 'completed', 'cancelled_by_system', 'expired'].includes(booking.status) ) {
        return res.status(409).json({ message: `Booking ${invoiceNumber} is already in a final state (${booking.status}) and cannot be updated.` });
    }
    
    const updateData = {};
    if (req.body.status) updateData.status = req.body.status;
    if (req.body.paymentMethod) updateData.payment_method = req.body.paymentMethod;
    if (req.body.totalAmount != null) updateData.final_total_amount = req.body.totalAmount;
    if (req.body.bookingProtection != null) updateData.protection_status = req.body.bookingProtection;
    if (req.body.protectionCost != null && req.body.bookingProtection) updateData.protection_fee = req.body.protectionCost;
    // --- FIX: Always update discount_amount from discountApplied ---
    if (req.body.discountApplied != null) updateData.discount_amount = req.body.discountApplied;
    // --- FIX: applied_voucher_id logic ---
    if (req.body.voucherCode) {
      let voucherId = null;
      if (typeof req.body.voucherCode === 'number') {
        voucherId = req.body.voucherCode;
      } else if (typeof req.body.voucherCode === 'string') {
        // Try parse as number first
        const parsed = parseInt(req.body.voucherCode, 10);
        if (!isNaN(parsed)) {
          voucherId = parsed;
        } else {
          // If not a number, treat as code and resolve to ID
          const voucher = await Voucher.getVoucherByCode(req.body.voucherCode);
          if (voucher) voucherId = voucher.id;
        }
      }
      if (voucherId) updateData.applied_voucher_id = voucherId;
    }
    if (req.body.status === 'completed' || req.body.status === 'confirmed') {
      updateData.payment_status = 'paid';
    }

    // Jika ada perubahan nominal, hitung ulang final_total_amount
    const shouldRecalculateTotal =
      (req.body.totalAmount == null) &&
      (
        req.body.protectionCost != null ||
        req.body.serviceFee != null ||
        req.body.discountApplied != null ||
        req.body.originalPrice != null
      );
    if (shouldRecalculateTotal) {
      const total_price = req.body.originalPrice != null ? req.body.originalPrice : booking.total_price;
      const service_fee = req.body.serviceFee != null ? req.body.serviceFee : booking.service_fee || 5000;
      const protection_fee = req.body.protectionCost != null ? req.body.protectionCost : booking.protection_fee || 0;
      const discount = req.body.discountApplied != null ? req.body.discountApplied : booking.discount_amount || 0;
      updateData.final_total_amount = total_price + service_fee + protection_fee - discount;
    }
    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'No valid update data provided.' });
    }

    await booking.update(updateData);
    
    const updatedBooking = await Booking.findOne({
        where: { id: booking.id },
    });

    sendEventToAllClients({
      type: 'BOOKING_UPDATED',
      payload: {
        invoiceNumber: invoiceNumber,
        status: updatedBooking.status,
        paymentStatus: updatedBooking.payment_status,
        userId: userId, 
      }
    });

    res.json({ 
      message: `Booking ${invoiceNumber} updated successfully.`,
      booking: updatedBooking 
    });
  } catch (error) {
    console.error('Error in updateBookingStatus:', error.message);
    console.error("Stack trace for updateBookingStatus error:", error.stack);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors.map(e => e.message) });
    }
    res.status(500).json({ message: error.message || 'Failed to update booking status.' });
  }
};

// User's transaction history
module.exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookingsFromDB = await Booking.findAll({ // Renamed to avoid confusion
      where: {
        user_id: userId,
        [Op.or]: [
            { payment_status: 'paid' },
            { status: 'confirmed' },
            { status: 'completed'},
            { status: 'cancelled_by_system' } // <-- Add this line to include cancelled_by_system
        ]
      },
      include: [
        {
          model: Court,
          as: 'court', 
          attributes: ['id', 'name'], 
          include: [
            {
              model: Arena,
              as: 'arena', 
              attributes: ['id', 'name'] 
            }
          ]
        }
      ],
      order: [['updated_at', 'DESC']]
    });

    // Log raw data from database for debugging
    console.log("Raw bookingsFromDB for transactions:", JSON.stringify(bookingsFromDB, null, 2));

    const formattedTransactions = bookingsFromDB.map(booking => {

      // Actual booking date (when the sport activity is scheduled)
      let actualBookingDateFormatted = 'Tanggal main tidak tersedia';
      if (booking.booking_date) {
        const parsedBookingDate = new Date(booking.booking_date);
        if (isValid(parsedBookingDate)) {
          try {
            if (effectiveLocale) {
              actualBookingDateFormatted = format(parsedBookingDate, 'EEEE, dd MMMM yyyy', { locale: effectiveLocale });
            } else {
              actualBookingDateFormatted = format(parsedBookingDate, 'dd MMMM yyyy');
            }
          } catch (e) {
            console.error(`Error formatting actual booking_date for ${booking.invoice_number}: `, e);
            actualBookingDateFormatted = booking.booking_date; // fallback to raw if format fails
          }
        } else {
          actualBookingDateFormatted = booking.booking_date; // fallback to raw if invalid
        }
      }
      
      // Time range for the booking
      let timeRange = 'Waktu main tidak tersedia';
      if (booking.start_time && booking.end_time) {
        timeRange = `${booking.start_time.slice(0,5)} - ${booking.end_time.slice(0,5)}`;
      } else if (booking.start_time) {
        timeRange = `${booking.start_time.slice(0,5)} onwards`;
      }
      
      // For clarity, let's rename the previous transactionDate to recordUpdateDate
      // and introduce bookingDate for the actual event date.

      return {
        id: booking.invoice_number,
        // transactionDate: recordUpdateDateFormatted, // This was the old \'transactionDate\'
        bookingDateFormatted: actualBookingDateFormatted, // Date of the actual booking/activity
        timeRange: timeRange, // Time of the actual booking/activity
        description: `Booking di ${booking.court?.arena?.name || 'N/A'} - ${booking.court?.name || 'N/A'}`,
        amount: (booking.final_total_amount !== null && typeof booking.final_total_amount === 'number') ? booking.final_total_amount : 0,
        status: booking.status,
        paymentMethod: booking.payment_method || null
      };
    });
    res.json(formattedTransactions);
  } catch (error) {
    console.error('Error fetching transactions:', error); 
    res.status(500).json({ message: error.message || 'Failed to retrieve transactions.' }); 
  }
};

// Expire pending bookings (job)
module.exports.expirePendingBookings = async () => {
  console.log('Running job to expire pending bookings...');
  try {
    const now = new Date();

    // Step 1: Find bookings to expire and fetch their necessary details
    const bookingsToExpire = await Booking.findAll({
      where: {
        status: 'pending',
        expiry_time: { [Op.lt]: now }
      },
      // Ensure all fields needed for SSE events are fetched
      attributes: ['id', 'invoice_number', 'user_id', 'court_id', 'booking_date', 'time_slots_details']
    });

    if (bookingsToExpire.length === 0) {
      console.log('No pending bookings to expire at this time.');
      return;
    }

    const bookingIdsToExpire = bookingsToExpire.map(b => b.id);

    // Step 2: Update these bookings to 'expired'
    const [affectedCount] = await Booking.update(
      { status: 'expired', payment_status: 'unpaid' },
      {
        where: {
          id: { [Op.in]: bookingIdsToExpire }
        }
      }
    );

    if (affectedCount > 0) {
      console.log(`${affectedCount} pending bookings have been marked as expired.`);
      
      bookingsToExpire.forEach(booking => {
        // booking object here contains the details fetched before the update
        
        // Send BOOKING_EXPIRED event (for user's booking list, history etc.)
        sendEventToAllClients({
          type: 'BOOKING_EXPIRED',
          payload: {
            invoiceNumber: booking.invoice_number,
            status: 'expired', // Explicitly set, as this is the new status
            userId: booking.user_id,
            // Include other relevant fields if your client needs them for this event
            // e.g., id: booking.id (the database PK)
          }
        });

        // Send SLOT_AVAILABILITY_UPDATED event (for the calendar/booking interface)
        if (booking.court_id && booking.booking_date && booking.time_slots_details) {
          try {
            // time_slots_details is already an array if stored as JSON and Sequelize parses it.
            // If it's a string, it needs parsing. Assuming it's a string from model definition.
            let timeSlotsArray = booking.time_slots_details;
            if (typeof booking.time_slots_details === 'string') {
                 timeSlotsArray = JSON.parse(booking.time_slots_details);
            }

            if (Array.isArray(timeSlotsArray) && timeSlotsArray.length > 0) {
              sendEventToAllClients({
                type: 'SLOT_AVAILABILITY_UPDATED',
                payload: {
                  courtId: booking.court_id,
                  date: booking.booking_date, // Should be in 'YYYY-MM-DD' format from DATEONLY
                  timeSlots: timeSlotsArray,
                  availability: 'available',
                  source: 'booking_expired_v2' // For easier debugging on client
                }
              });
              console.log(`Sent SLOT_AVAILABILITY_UPDATED for expired booking ${booking.invoice_number} on court ${booking.court_id} for date ${booking.booking_date}`);
            } else {
              console.warn(`Time slots array for expired booking ${booking.invoice_number} was empty or not an array after parsing.`);
            }
          } catch (e) {
            console.error(`Error parsing time_slots_details ('${booking.time_slots_details}') or sending SLOT_AVAILABILITY_UPDATED for expired booking ${booking.invoice_number}:`, e);
          }
        } else {
          console.warn(`Missing details for SLOT_AVAILABILITY_UPDATED for expired booking ${booking.invoice_number}: court_id=${booking.court_id}, booking_date=${booking.booking_date}, time_slots_details_present=${!!booking.time_slots_details}`);
        }
      });
    } else if (bookingsToExpire.length > 0 && affectedCount === 0) {
      // This case means we found bookings to expire, but the update query affected 0 rows.
      // This could happen if, in a race condition, another process already updated them.
      console.warn('Found bookings to expire, but the update operation affected 0 rows. They might have been updated by another process.');
    }
  } catch (error) {
    console.error('Error in expirePendingBookings job:', error);
  }
};
