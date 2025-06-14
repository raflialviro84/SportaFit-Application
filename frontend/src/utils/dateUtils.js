/**
 * Utility functions for date formatting
 */

/**
 * Format a date string to a more readable format (DD/MM/YYYY)
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-'; // Invalid date
  
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Format a date string to include time (DD/MM/YYYY HH:MM)
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-'; // Invalid date
  
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Calculate age based on birth date
 * @param {string} birthDateString - ISO date string
 * @returns {number} Age in years
 */
export const calculateAge = (birthDateString) => {
  if (!birthDateString) return 0;
  
  const birthDate = new Date(birthDateString);
  if (isNaN(birthDate.getTime())) return 0; // Invalid date
  
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};