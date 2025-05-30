// src/services/apiService.js

// Base API URL
export const API_BASE_URL = '/api';

// Helper untuk refresh token
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('No refresh token found');
  const res = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal refresh token');
  localStorage.setItem('token', data.accessToken);
  return data.accessToken;
}

// Helper fetch yang auto refresh token jika 401
export async function fetchWithAuth(url, options = {}, retry = true) {
  let token = localStorage.getItem('token');
  options.headers = options.headers || {};
  if (token) options.headers['Authorization'] = `Bearer ${token}`;
  let response = await fetch(url, options);
  if (response.status === 401 && retry) {
    try {
      token = await refreshAccessToken();
      options.headers['Authorization'] = `Bearer ${token}`;
      response = await fetch(url, options);
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      throw new Error('Session expired. Please login again.');
    }
  }
  return response;
}

// Arena Services
export const ArenaService = {
  // Get all arenas
  getAllArenas: async (searchQuery = '', city = '') => {
    try {
      let url = `${API_BASE_URL}/arenas`;

      // Add search parameters if they exist
      if (searchQuery || city) {
        url = `${API_BASE_URL}/arenas/search`;
        const params = new URLSearchParams();
        if (searchQuery) params.append('query', searchQuery);
        if (city) params.append('city', city);
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching arenas:', error);
      throw error;
    }
  },

  // Get arena by ID
  getArenaById: async (id) => {
    try {
      const url = `${API_BASE_URL}/arenas/${id}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching arena with ID ${id}:`, error);
      throw error;
    }
  },

  // Get courts by arena ID
  getCourtsByArenaId: async (id) => {
    try {
      const url = `${API_BASE_URL}/arenas/${id}/courts`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching courts for arena ID ${id}:`, error);
      throw error;
    }
  }
};

// Auth Services
export const AuthService = {
  // Login
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  },

  // Register
  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Registration failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  }
};

// Voucher Services
export const VoucherService = {
  // Get all vouchers
  getAllVouchers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/vouchers`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      throw error;
    }
  },

  // Get voucher by ID
  getVoucherById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/vouchers/${id}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching voucher with ID ${id}:`, error);
      throw error;
    }
  },

  // Get voucher by code
  getVoucherByCode: async (code) => {
    try {
      const response = await fetch(`${API_BASE_URL}/vouchers/code/${code}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching voucher with code ${code}:`, error);
      throw error;
    }
  },

  // Get user's vouchers
  getUserVouchers: async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/vouchers/user/my-vouchers`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user vouchers:', error);
      throw error;
    }
  },

  // Add voucher to user
  addVoucherToUser: async (voucherCode) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/vouchers/user/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voucherCode })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to add voucher');
      }
      return await response.json();
    } catch (error) {
      console.error('Error adding voucher to user:', error);
      throw error;
    }
  },

  // Use voucher
  useVoucher: async (voucherId) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/vouchers/user/use`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voucherId })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to use voucher');
      }
      return await response.json();
    } catch (error) {
      console.error('Error using voucher:', error);
      throw error;
    }
  }
};

export default {
  ArenaService,
  AuthService,
  VoucherService
};
