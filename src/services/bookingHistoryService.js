// src/services/bookingHistoryService.js
// Service for managing booking history and transactions

// Functions related to booking history, to be kept if still used by other parts of the application
// or if they are distinct from BookingService.js functionalities.

export const getRemainingTime = (expiryTimeString) => {
  try {
    const now = new Date();
    const expiryTime = new Date(expiryTimeString);

    const diffInSeconds = Math.floor((expiryTime - now) / 1000);
    return diffInSeconds > 0 ? diffInSeconds : 0;
  } catch (error) {
    console.error('Error calculating remaining time:', error);
    return 0;
  }
};

export const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

// Default export an object of the utility functions.
export default {
  getRemainingTime,
  formatTime,
};
