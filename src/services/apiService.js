// src/services/apiService.js

// Base API URL
export const API_BASE_URL = '/api';

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
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/vouchers/user/my-vouchers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

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
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/vouchers/user/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/vouchers/user/use`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
