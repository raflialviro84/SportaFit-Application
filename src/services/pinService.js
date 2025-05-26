// src/services/pinService.js

const API_BASE_URL = '/api/pin';

// Fungsi untuk mendapatkan token dari localStorage
const getAuthToken = () => {
  // Ambil token langsung dari localStorage agar konsisten dengan AuthContext
  return localStorage.getItem('token');
};

// Fungsi untuk memeriksa apakah pengguna sudah memiliki PIN
export const hasPin = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No auth token found');
    }
    const response = await fetch(`${API_BASE_URL}/check`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data.hasPin;
  } catch (error) {
    console.error('Error checking PIN:', error);
    return false;
  }
};

// Fungsi untuk menyimpan PIN baru
export const savePin = async (pin) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No auth token found');
    }
    const response = await fetch(`${API_BASE_URL}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ pin })
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error saving PIN:', error);
    return false;
  }
};

// Fungsi untuk memverifikasi PIN
export const verifyPin = async (inputPin) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No auth token found');
    }
    const response = await fetch(`${API_BASE_URL}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ pin: inputPin })
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data.isValid;
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return false;
  }
};

// Fungsi untuk mengubah PIN
export const updatePin = async (oldPin, newPin) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No auth token found');
    }
    const response = await fetch(`${API_BASE_URL}/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ oldPin, newPin })
    });
    if (!response.ok) {
      if (response.status === 401) {
        return false;
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error updating PIN:', error);
    return false;
  }
};

// Fungsi untuk menghapus PIN (opsional, untuk testing)
export const resetPin = async () => {
  // Implementasi opsional jika backend mendukung endpoint reset PIN
  return false;
};

export default {
  hasPin,
  savePin,
  verifyPin,
  updatePin,
  resetPin
};
