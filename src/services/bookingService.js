// src/services/bookingService.js

// Base API URL
const API_BASE_URL = '/api';

// Helper function to get the auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token'); // Or however you store your token
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
      const token = getAuthToken();
      const url = `${API_BASE_URL}/bookings`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Add Authorization header
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
  getUserBookings: async () => { // Removed userId parameter
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('User not authenticated');
      }
      // Corrected URL to fetch bookings for the authenticated user
      const url = `${API_BASE_URL}/bookings/user/me`; 
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}` // Add Authorization header
        }
      });
      
      if (!response.ok) {
        // Log the response status and text for more detailed error information
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
  
  // Update booking status
  updateBookingStatus: async (invoiceNumber, statusData) => {
    try {
      const token = getAuthToken();
      const url = `${API_BASE_URL}/bookings/${invoiceNumber}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Add Authorization header
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
      const token = getAuthToken();
      if (!token) {
        throw new Error('User not authenticated');
      }
      const url = `${API_BASE_URL}/bookings/${invoiceNumber}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}` // Add Authorization header
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
  }
};

export default BookingService;
