// src/pages/auth/DemoLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { IoArrowBack } from "react-icons/io5";

function DemoLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fungsi untuk login demo tanpa backend
  const handleDemoLogin = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      
      // Login dengan data dummy
      await login("demo@example.com", "password123");
      
      setSuccess("Login berhasil! Mengalihkan ke halaman profil...");
      
      // Redirect ke halaman profil setelah 1 detik
      setTimeout(() => {
        navigate("/profil");
      }, 1000);
    } catch (err) {
      console.error("Error during demo login:", err);
      setError(err.message || "Login gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-[#F9FAFB] px-4 py-6">
      <div className="container max-w-sm sm:max-w-md md:max-w-lg lg:max-w-[434px] w-full bg-white rounded-3xl shadow-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center px-6 py-4 border-b">
          <button onClick={() => navigate(-1)} className="text-sporta-blue">
            <IoArrowBack size={24} />
          </button>
          <h2 className="flex-1 text-center text-xl font-bold font-jakarta text-black">Demo Login</h2>
          {/* placeholder untuk rata tengah */}
          <div style={{ width: 24 }} />
        </div>

        {/* Konten */}
        <div className="flex-1 overflow-y-auto font-jakarta p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg">
              <p className="text-sm">{success}</p>
            </div>
          )}
          
          {/* Informasi */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-black mb-2">Login Demo</h3>
            <p className="text-sm text-gray-600 mb-4">
              Halaman ini digunakan untuk login demo tanpa backend. Data yang digunakan adalah data dummy yang disimpan di localStorage.
            </p>
          </div>
          
          {/* Tombol Login Demo */}
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className={`w-full bg-sporta-blue text-white py-3 rounded-xl text-base font-semibold hover:bg-blue-700 transition-colors ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Memproses..." : "Login Demo"}
          </button>
          
          {/* Link ke halaman login sebenarnya */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Jika backend sudah siap, gunakan{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-sporta-blue hover:underline"
              >
                halaman login sebenarnya
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DemoLogin;
