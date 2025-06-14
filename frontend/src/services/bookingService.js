// src/services/bookingService.js

// Base API URL
const API_BASE_URL = '/api';

// Helper function to get the auth token from localStorage
const getToken = () => {
  // Coba ambil token admin terlebih dahulu, jika tidak ada ambil token user biasa
  return localStorage.getItem("adminToken") || localStorage.getItem("token");
};

// Booking Services
export const BookingService = {
  // Get available slots for a court on a specific date
  getAvailableSlots: async (courtId, date) => {
    try {
      const url = `${API_BASE_URL}/bookings/available-slots?courtId=${courtId}&date=${date}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching available slots:', error);
      throw error;
    }
  },
  
  // Get courts by arena ID with availability info
  getCourtsByArenaWithAvailability: async (arenaId, date) => {
    try {
      let url = `${API_BASE_URL}/bookings/courts?arenaId=${arenaId}`;
      if (date) {
        url += `&date=${date}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching courts with availability:', error);
      throw error;
    }
  },
  
  // Create a new booking
  createBooking: async (bookingData) => {
    try {
      const token = getToken();
      const url = `${API_BASE_URL}/bookings`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create booking');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },
  
  // Get current user's bookings
  getUserBookings: async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('User not authenticated');
      }
      // Corrected URL to fetch bookings for the authenticated user
      const url = `${API_BASE_URL}/bookings/user/me`; 
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error fetching user bookings: ${response.status} - ${errorText}`);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw error;
    }
  },
  
  // Update booking status (user)
  updateUserBookingStatus: async (invoiceNumber, statusData) => {
    try {
      const token = getToken();
      const url = `${API_BASE_URL}/bookings/${invoiceNumber}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(statusData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  },

  // Get booking by ID (invoice number)
  getBookingById: async (invoiceNumber) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('User not authenticated');
      }
      const url = `${API_BASE_URL}/bookings/${invoiceNumber}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error fetching booking by ID: ${response.status} - ${errorText}`);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching booking ${invoiceNumber}:`, error);
      throw error;
    }
  },

  // Get all bookings (admin only)
  getAllBookings: async (page = 1, limit = 10, search = '', status = '', date = '') => {
    try {
      const token = getToken();
      if (!token) throw new Error('Admin not authenticated');
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(status && { status }),
        ...(date && { date })
      });
      const url = `${API_BASE_URL}/bookings/admin/all?${params}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching admin bookings:', error);
      throw error;
    }
  },

  // Update booking status (admin only)
  updateBookingStatus: async (invoiceNumber, status, paymentStatus = null, notes = '') => {
    try {
      const token = getToken();
      if (!token) throw new Error('Admin not authenticated');

      const url = `${API_BASE_URL}/bookings/admin/${invoiceNumber}/status`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          status,
          paymentStatus,
          notes
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  },

  // Get booking detail (admin only)
  getBookingDetail: async (invoiceNumber) => {
    try {
      const token = getToken();
      if (!token) throw new Error('Admin not authenticated');

      const url = `${API_BASE_URL}/bookings/admin/${invoiceNumber}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching booking detail:', error);
      throw error;
    }
  },

  // Get booking statistics for admin dashboard
  getBookingStats: async () => {
    try {
      const token = getToken();
      if (!token) throw new Error('Admin not authenticated');

      const url = `${API_BASE_URL}/bookings/admin/stats`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      throw error;
    }
  }
};

export default BookingService;
