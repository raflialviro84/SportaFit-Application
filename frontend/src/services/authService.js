// src/services/authService.js
export function getAuthToken() {
  return localStorage.getItem("token");
}
