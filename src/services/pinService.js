// src/services/pinService.js

// Base API URL
const API_BASE_URL = '/api/pin';

// Fungsi untuk mendapatkan token dari localStorage
const getAuthToken = () => {
  const user = localStorage.getItem('user');
  if (!user) return null;

  try {
    const userData = JSON.parse(user);
    return userData.token;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// Fungsi untuk memeriksa apakah pengguna sudah memiliki PIN
export const hasPin = async () => {
  try {
    console.log('Checking if user has PIN');

    // Untuk sementara, kita akan menggunakan localStorage saja
    // karena backend mungkin belum siap
    const PIN_KEY = 'user_pin';
    const pin = localStorage.getItem(PIN_KEY);
    const hasPin = pin !== null && pin !== undefined && pin !== '';
    console.log('User has PIN:', hasPin, 'PIN value:', pin);
    return hasPin;

    /* Kode untuk backend yang sudah siap:
    const token = getAuthToken();
    if (!token) {
      console.error('No auth token found');
      return false;
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
    */
  } catch (error) {
    console.error('Error checking PIN:', error);

    // Fallback ke localStorage untuk kompatibilitas
    const PIN_KEY = 'user_pin';
    return localStorage.getItem(PIN_KEY) !== null;
  }
};

// Fungsi untuk menyimpan PIN baru
export const savePin = async (pin) => {
  try {
    console.log('Saving PIN:', pin);

    // Untuk sementara, kita akan menggunakan localStorage saja
    // karena backend mungkin belum siap
    localStorage.setItem('user_pin', String(pin));

    // Verifikasi bahwa PIN telah disimpan
    const savedPin = localStorage.getItem('user_pin');
    console.log('PIN saved to localStorage:', savedPin);

    return true;

    /* Kode untuk backend yang sudah siap:
    const token = getAuthToken();
    if (!token) {
      console.error('No auth token found');

      // Fallback ke localStorage untuk kompatibilitas
      localStorage.setItem('user_pin', pin);
      return true;
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
    */
  } catch (error) {
    console.error('Error saving PIN:', error);

    // Fallback ke localStorage untuk kompatibilitas
    localStorage.setItem('user_pin', pin);
    return true;
  }
};

// Fungsi untuk memverifikasi PIN
export const verifyPin = async (inputPin) => {
  try {
    console.log('Verifying PIN:', inputPin);

    // Untuk sementara, kita akan menggunakan localStorage saja
    // karena backend mungkin belum siap
    const savedPin = localStorage.getItem('user_pin');
    console.log('Saved PIN in localStorage:', savedPin);

    // Jika tidak ada PIN yang tersimpan, anggap valid (untuk testing)
    if (!savedPin) {
      console.log('No saved PIN found, treating as valid for testing');
      return true;
    }

    // Pastikan kita membandingkan string dengan string
    const isValid = String(savedPin) === String(inputPin);
    console.log('PIN verification result:', isValid);
    return isValid;

    /* Kode untuk backend yang sudah siap:
    const token = getAuthToken();
    if (!token) {
      console.error('No auth token found');

      // Fallback ke localStorage untuk kompatibilitas
      const savedPin = localStorage.getItem('user_pin');
      return savedPin === inputPin;
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
    */
  } catch (error) {
    console.error('Error verifying PIN:', error);

    // Fallback ke localStorage untuk kompatibilitas
    const savedPin = localStorage.getItem('user_pin');
    return savedPin === inputPin;
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
        // PIN lama salah
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

// Fungsi untuk menghapus PIN (untuk keperluan testing)
export const resetPin = async () => {
  try {
    console.log('Resetting PIN');

    // Untuk reset PIN, kita hanya menghapus dari localStorage
    // Dalam implementasi sebenarnya, ini akan memanggil API
    localStorage.removeItem('user_pin');

    // Verifikasi bahwa PIN telah dihapus
    const pin = localStorage.getItem('user_pin');
    console.log('PIN after reset:', pin);

    return true;
  } catch (error) {
    console.error('Error resetting PIN:', error);
    return false;
  }
};

export default {
  hasPin,
  savePin,
  verifyPin,
  updatePin,
  resetPin
};
