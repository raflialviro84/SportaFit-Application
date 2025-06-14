// src/context/AuthContext.jsx
import React, { useState, useEffect, useContext } from "react"; // Added useContext
import { UserService } from "../services/userService";
import { AuthContext } from "./auth-context.js";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fungsi untuk refresh user dari backend
  const refreshUser = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      console.log("[Auth] Token from localStorage:", token);
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const res = await fetch("/api/auth/me", {
        headers: { "Authorization": `Bearer ${token}` },
        credentials: "include"
      });
      const data = await res.json();
      console.log("[Auth] /api/auth/me response:", data);
      if (!res.ok) throw new Error(data.message || "Token tidak valid");
      setUser(data.user);
    } catch (err) {
      setUser(null);
      setError(err.message);
      localStorage.removeItem("token");
      console.error("[Auth] Error refreshUser:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      console.log("[Auth] Login response:", data);
      if (!response.ok) throw new Error(data.message || "Login gagal");
      const token = data.user?.token || data.token;
      const refreshToken = data.user?.refreshToken || data.refreshToken;
      if (!token) throw new Error("Token tidak ditemukan di response login");
      localStorage.setItem("token", token);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      await refreshUser();
      return data.user;
    } catch (err) {
      setError(err.message || "Terjadi kesalahan jaringan. Silakan coba lagi.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      // ignore error
    }
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setError(null);
  };

  const updateUserData = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await UserService.updateProfile(userData);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updateUserData,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Added useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
