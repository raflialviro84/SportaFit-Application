import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: form.email,
          password: form.password
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login gagal");
      }

      // Simpan token ke localStorage agar AuthProvider bisa persist login
      localStorage.setItem("token", data.user?.token || data.token);
      // Simpan user ke localStorage agar halaman lain bisa akses userId
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      
      // Cek apakah user adalah admin
      if (data.user?.role === 'admin') {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/home";
      }

    } catch (err) {
      setError(err.message || "Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk login admin langsung
  const handleAdminLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: "admin",
          password: "12345678"
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login admin gagal");
      }

      // Simpan token admin ke localStorage
      localStorage.setItem("token", data.user?.token || data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Redirect ke admin dashboard
      window.location.href = "/admin/dashboard";

    } catch (err) {
      setError(err.message || "Login admin gagal.");
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
          <h2 className="text-[26px] sm:text-[28px] font-bold text-sporta-blue text-center mb-6 font-jakarta">
            Selamat Datang!
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                name="email"
                type="email"
                placeholder="Masukkan Email"
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
                placeholder="Masukkan Kata Sandi"
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
              <a
                href="/forgot-password"
                className="text-[13px] font-bold text-sporta-blue hover:underline font-jakarta"
              >
                Lupa Kata Sandi?
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-sporta-blue text-white font-semibold rounded-lg hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          {/* Tombol Login Admin */}
          <div className="mt-4">
            <button
              onClick={handleAdminLogin}
              disabled={loading}
              className="w-full py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition text-sm"
            >
              {loading ? "Memproses..." : "Login sebagai Admin"}
            </button>
          </div>

          {/* Social Login */}
          <div className="mt-8 text-center text-sm text-gray-500">
            Atau masuk dengan
          </div>
          <div className="flex justify-center gap-4 mt-5 mb-4">
            <a href="/api/auth/google" className="social-login-button">
              <img src="/google.png" alt="Google" className="w-6 h-6 cursor-pointer" />
            </a>
            <a href="/api/auth/facebook" className="social-login-button">
              <img src="/fb.png" alt="Facebook" className="w-6 h-6 cursor-pointer" />
            </a>
            <a href="/api/auth/twitter" className="social-login-button">
              <img src="/x.png" alt="X" className="w-6 h-6 cursor-pointer" />
            </a>
          </div>

          {/* Footer */}
          <div className="text-center text-sm mt-5">
            Belum punya Akun?{" "}
            <a
              href="/register"
              className="text-[13px] font-jakarta text-sporta-blue font-bold hover:underline"
            >
              Daftar Sekarang
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
