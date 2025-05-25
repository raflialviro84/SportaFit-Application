// src/pages/auth/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth-context";
import { IoArrowBack } from "react-icons/io5";

function Login() {
  const navigate = useNavigate();
  const { login, error: authError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi input
    if (!email || !password) {
      setError("Email dan password harus diisi");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      
      // Panggil fungsi login dari AuthContext
      await login(email, password);
      
      // Redirect ke halaman profil setelah login berhasil
      navigate("/profil");
    } catch (err) {
      setError(err.message || "Login gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-[#F9FAFB] px-4 py-6">
      <div className="container max-w-sm sm:max-w-md md:max-w-lg lg:max-w-[434px] w-full bg-white rounded-3xl shadow-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white px-6 py-4 flex items-center border-b">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <IoArrowBack size={24} className="text-black" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-xl font-semibold text-black">Login</h1>
          </div>
        </div>

        {/* Konten */}
        <div className="flex-1 overflow-y-auto font-jakarta p-6">
          {/* Form Login */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sporta-blue"
                placeholder="Masukkan email"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sporta-blue"
                placeholder="Masukkan password"
              />
            </div>

            {/* Error Message */}
            {(error || authError) && (
              <div className="text-red-500 text-sm">
                {error || authError}
              </div>
            )}

            {/* Tombol Login */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-sporta-blue text-white py-3 rounded-xl text-base font-semibold hover:bg-blue-700 transition-colors ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Memproses..." : "Login"}
            </button>
          </form>

          {/* Link Register */}
          <div className="mt-6 text-center">
            <p className="text-sm text-black">
              Belum punya akun?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-sporta-blue font-semibold hover:underline"
              >
                Daftar
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
