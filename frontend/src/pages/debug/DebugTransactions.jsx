// src/pages/debug/DebugTransactions.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import TransactionService from "../../services/transactionService";
import BookingService from "../../services/bookingService"; // Assuming BookingService exists and has similar functions or can be adapted

export default function DebugTransactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch transactions using TransactionService
      const allTransactions = await TransactionService.getTransactions(); 
      // Fetch bookings using BookingService (assuming a similar method like getUserBookings)
      // This might need adjustment based on actual BookingService implementation
      const allBookings = await BookingService.getUserBookings(); 

      setTransactions(allTransactions || []); // Ensure it's an array
      setBookings(allBookings || []); // Ensure it's an array

      setMessage(`Loaded ${allTransactions?.length || 0} transactions and ${allBookings?.length || 0} bookings`);
    } catch (error) {
      setMessage(`Error loading data: ${error.message}`);
      console.error("Error loading data for debug:", error);
      setTransactions([]); // Set to empty array on error
      setBookings([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Clear all transactions - THIS IS A DEBUG FUNCTION, BE CAREFUL
  // This would require a backend endpoint to clear transactions for the user, 
  // or if it was purely localStorage based, that logic is now removed.
  // For now, this button will likely not function as intended without a backend equivalent.
  const handleClearTransactions = async () => {
    try {
      // Placeholder: In a real scenario, you might call a debug endpoint on the backend.
      // await TransactionService.clearUserTransactions(); // Example hypothetical function
      setMessage("Clearing transactions is a backend operation and not directly supported via frontend services in this refactor. Manually clear if needed for debug.");
      // Reload data to reflect any manual changes if applicable
      // loadData(); 
    } catch (error) {
      setMessage(`Error clearing transactions: ${error.message}`);
    }
  };

  // Clear all booking history - SIMILAR TO ABOVE
  // This would also require a backend endpoint.
  const handleClearBookings = async () => {
    try {
      // Placeholder: In a real scenario, you might call a debug endpoint on the backend.
      // await BookingService.clearUserBookings(); // Example hypothetical function
      setMessage("Clearing bookings is a backend operation and not directly supported via frontend services in this refactor. Manually clear if needed for debug.");
      // loadData();
    } catch (error) {
      setMessage(`Error clearing booking history: ${error.message}`);
    }
  };

  // Add mock transaction - THIS IS A DEBUG FUNCTION
  // This would require a backend endpoint to create a transaction, 
  // or if it was purely localStorage based, that logic is now removed.
  // The `addTransactions` from bookingHistoryService was likely localStorage based.
  const handleAddMockTransaction = async () => {
    try {
      // This is a placeholder. In a real scenario, you would call a service method
      // that interacts with the backend to create a mock transaction.
      // e.g., await TransactionService.createMockTransaction(mockTransactionData);
      setMessage("Adding mock transactions now requires backend interaction. This button is a placeholder.");
      // loadData(); // Reload after attempting to add
    } catch (error) {
      setMessage(`Error adding mock transaction: ${error.message}`);
    }
  };
  
  // Move booking to transaction - THIS IS A DEBUG FUNCTION
  // This logic was specific to localStorage and is no longer applicable directly.
  // A real backend would handle transaction creation upon successful booking and payment.
  const handleMoveBookingToTransaction = async (bookingId) => {
    try {
      // This is a placeholder. The original function `moveBookingToTransaction` was localStorage-based.
      // Simulating this would involve fetching a booking and then creating a transaction from it via backend services.
      setMessage(`Moving booking to transaction (${bookingId}) now involves backend logic. This button is a placeholder.`);
      // loadData();
    } catch (error) {
      setMessage(`Error moving booking to transaction: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24 font-jakarta">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-[#F9FAFB] z-20">
        <div className="max-w-[434px] mx-auto px-4 pt-6 pb-4">
          <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="p-2 text-gray-600">
              <IoArrowBack size={24} />
            </button>
            <h1 className="flex-1 text-center text-xl font-bold">Debug Transactions</h1>
            <div className="w-6" />
          </div>
        </div>
        <div className="border-b border-gray-200" />
      </div>

      {/* Content */}
      <div className="pt-24 max-w-[434px] mx-auto px-4 space-y-4">
        {/* Message */}
        {message && (
          <div className="bg-blue-100 text-blue-800 p-3 rounded-lg mb-4">
            {message}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={loadData}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg"
          >
            Refresh Data
          </button>
          <button
            onClick={handleAddMockTransaction}
            className="bg-green-500 text-white py-2 px-4 rounded-lg"
          >
            Add Mock Success Transaction (1 Hour)
          </button>
          <button
            onClick={handleAddMockTransaction}
            className="bg-green-300 text-white py-2 px-4 rounded-lg"
          >
            Add Mock Success Transaction (2 Hours)
          </button>
          <button
            onClick={handleAddMockTransaction}
            className="bg-green-200 text-white py-2 px-4 rounded-lg"
          >
            Add Mock Success Transaction (3 Hours)
          </button>
          <button
            onClick={handleAddMockTransaction}
            className="bg-yellow-500 text-white py-2 px-4 rounded-lg"
          >
            Add Mock Failed Transaction
          </button>
          <button
            onClick={handleClearTransactions}
            className="bg-red-500 text-white py-2 px-4 rounded-lg"
          >
            Clear All Transactions
          </button>
          <button
            onClick={handleClearBookings}
            className="bg-orange-500 text-white py-2 px-4 rounded-lg"
          >
            Clear All Bookings
          </button>
          <button
            onClick={handleAddMockTransaction}
            className="bg-purple-500 text-white py-2 px-4 rounded-lg"
          >
            Add Mock Booking to History
          </button>
          <button
            onClick={() => handleMoveBookingToTransaction("some-booking-id")}
            className="bg-indigo-500 text-white py-2 px-4 rounded-lg"
          >
            Test Move Booking to Transaction
          </button>
        </div>

        {/* Transactions */}
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-2">Transactions ({transactions.length})</h2>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="bg-gray-100 p-4 rounded-lg text-gray-500 text-center">
              No transactions found
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div key={tx.id} className="bg-white p-3 rounded-lg shadow">
                  <div className="text-xs text-gray-500">ID: {tx.id}</div>
                  <div className="font-semibold">{tx.arenaName || tx.venueTitle}</div>
                  <div className="text-sm">{tx.formattedDate} | {tx.time}</div>
                  <div className="text-sm">Status: <span className={tx.status === "Berhasil" ? "text-green-600" : "text-red-600"}>{tx.status}</span></div>
                  <div className="text-sm">Total: Rp{tx.totalPrice?.toLocaleString() || "0"}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bookings */}
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-2">Bookings ({bookings.length})</h2>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-gray-100 p-4 rounded-lg text-gray-500 text-center">
              No bookings found
            </div>
          ) : (
            <div className="space-y-2">
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-white p-3 rounded-lg shadow">
                  <div className="text-xs text-gray-500">ID: {booking.id}</div>
                  <div className="font-semibold">{booking.arenaName || booking.venueTitle}</div>
                  <div className="text-sm">{booking.formattedDate} | {booking.time}</div>
                  <div className="text-sm">Status: <span className={booking.status === "Berhasil" ? "text-green-600" : "text-red-600"}>{booking.status}</span></div>
                  <div className="text-sm">Total: Rp{booking.totalPrice?.toLocaleString() || "0"}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
