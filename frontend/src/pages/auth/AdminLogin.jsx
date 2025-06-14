// src/pages/auth/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";

function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validasi sederhana
    if (!form.email || !form.password) {
      setError("Email dan password wajib diisi.");
      setLoading(false);
      return;
    }

    try {
      // Buat objek payload yang akan dikirim ke server
      const payload = {
        email: form.email,
        password: form.password
      };
      
      console.log("Sending admin login request with:", { email: form.email });
      
      // Gunakan satu endpoint yang konsisten (localhost) karena frontend dan backend sudah berjalan
      const apiUrl = "http://localhost:3000/api/auth/admin-login";
      
      console.log(`Connecting to: ${apiUrl}`);
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
        credentials: 'include' // Untuk mendukung cookies
      });
      
      console.log(`Response status: ${res.status}`);
      
      // Check jika respons valid sebelum mencoba parse JSON
      if (!res.ok) {
        let errorMessage = "Login admin gagal";
        
        try {
          // Periksa content-type dari respons
          const contentType = res.headers.get('content-type');
          
          // Coba dapatkan teks respons untuk debugging
          const responseText = await res.text();
          console.error("Error response:", responseText);
          
          // Coba parse JSON jika format respon adalah JSON
          if (contentType && contentType.includes('application/json')) {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorMessage;
          } else {
            errorMessage = `${errorMessage}: Server error (${res.status})`;
          }
        } catch (jsonError) {
          console.error("Error parsing response:", jsonError);
          errorMessage = `${errorMessage}: ${res.statusText} (${res.status})`;
        }
        
        throw new Error(errorMessage);
      }
      
      // Parse respons JSON
      let data;
      try {
        data = await res.json();
        console.log("Admin login response:", data);
      } catch (jsonError) {
        console.error("Error parsing success response:", jsonError);
        throw new Error("Format respons server tidak valid");
      }
      
      // Validasi data respons dengan pengecekan yang lebih sederhana
      if (!data) {
        throw new Error("Respons server kosong");
      }
      
      // Ambil token dari respons
      const token = data.token;
      
      if (!token) {
        console.error("Response data missing token:", data);
        throw new Error("Token tidak ditemukan dalam respons server");
      }

      // Simpan token admin ke localStorage
      localStorage.setItem("adminToken", token);
      
      // Simpan user admin ke localStorage (jika ada)
      if (data.user) {
        localStorage.setItem("adminUser", JSON.stringify(data.user));
      }
      
      console.log("Login berhasil, redirect ke dashboard...");
      
      // Redirect ke dashboard admin
      navigate("/admin/dashboard");

    } catch (err) {
      console.error("Admin login error:", err);
      setError(err.message || "Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4 py-6">
      <div className="container max-w-sm w-full bg-white rounded-3xl shadow-md overflow-hidden flex flex-col">

        {/* Gambar Header */}
        <div className="w-full h-[200px] bg-[url('/login-hero.png')] bg-cover bg-center sm:bg-right rounded-t-3xl" />

        {/* Konten Login */}
        <div className="flex flex-col px-6 py-6 sm:p-8 flex-grow">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate("/login")}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <IoArrowBack size={20} className="text-gray-700" />
            </button>
            <h2 className="text-[26px] sm:text-[28px] font-bold text-sporta-blue text-center flex-1 mr-8 font-jakarta">
              Login Admin
            </h2>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                name="email"
                type="email"
                placeholder="Masukkan Email Admin"
                className="w-full px-4 py-2 border rounded-lg text-sm"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="username"
                aria-label="Email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Kata Sandi</label>
              <input
                name="password"
                type="password"
                placeholder="Masukkan Kata Sandi Admin"
                className="w-full px-4 py-2 border rounded-lg text-sm"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                aria-label="Kata Sandi"
                spellCheck={false}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-2 sm:gap-0">
              <label className="flex items-center gap-2">
                <input
                  name="remember"
                  type="checkbox"
                  checked={form.remember}
                  onChange={handleChange}
                />
                Ingat Saya
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-sporta-blue text-white font-semibold rounded-lg hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Memproses...
                </div>
              ) : "Masuk"}
            </button>
          </form>
          
          {/* Demo Credentials */}
          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-medium text-blue-800 mb-1">Demo Admin:</p>
            <p className="text-xs text-blue-700">Email: admin@sportafit.com</p>
            <p className="text-xs text-blue-700">Password: admin123</p>
          </div>

          {/* Back to User Login */}
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate("/login")}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              ← Kembali ke Login User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;