// src/services/transactionService.js

import { API_BASE_URL } from "./apiService"; // Assuming you have a central apiService for base URL

/**
 * Retrieves authentication token from localStorage.
 * Consider moving this to a shared auth service if used in multiple places.
 * @returns {string|null} The authentication token or null if not found
 */
function getAuthToken() {
  return localStorage.getItem("token");
}

const TransactionService = {
  /**
   * Get all transactions for the current user.
   * The backend should handle user identification based on the token.
   */
  getTransactions: async () => {
    const token = getAuthToken();
    if (!token) {
      // Handle unauthenticated state, perhaps redirect to login or show an error
      console.error("User not authenticated");
      throw new Error("User not authenticated");
    }

    try {
      // Corrected endpoint: /api/transactions
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch transactions");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error; // Re-throw to be caught by the calling component
    }
  },

  /**
   * Get a specific transaction by its ID.
   */
  getTransactionById: async (transactionId) => {
    const token = getAuthToken();
    if (!token) {
      console.error("User not authenticated");
      throw new Error("User not authenticated");
    }

    try {      // Endpoint yang benar: /api/bookings/:invoiceNumber
      const response = await fetch(`${API_BASE_URL}/bookings/${transactionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch transaction details");
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching transaction ${transactionId}:`, error);
      throw error;
    }
  },
  
  // Add other transaction-related methods if needed, e.g.,
  // createTransaction, updateTransactionStatus (if applicable and different from booking status updates)
};

export default TransactionService;
