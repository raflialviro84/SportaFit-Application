import React, { useState } from "react";
import { API_BASE_URL } from "../../config/api";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Email wajib diisi.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // Periksa apakah respons kosong
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        throw new Error(data.message || "Gagal mengirim email reset.");
      }

      // Tampilkan pesan sukses terlebih dahulu
      setMessage("Link reset telah dikirim. Cek email Anda.");

      // Setelah 3 detik, baru arahkan ke halaman verification
      setTimeout(() => {
        navigate("/verification", { state: { email } }); // Mengirim email ke halaman verification
      }, 3000); // Jeda 3 detik

    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
    }
  };

  return (
    <div className="w-full h-auto flex justify-center items-start bg-[#F9FAFB] px-4 py-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-md p-6 font-jakarta mt-5">

        {/* Tombol Kembali */}
        <button
          className="text-sporta-blue text-sm mb-4 flex items-center gap-2"
          onClick={() => navigate("/login")}
        >
          <IoArrowBack size={20} />
          <span className="font-medium">Kembali</span>
        </button>

        {/* Judul */}
        <h2 className="text-xl font-bold text-black mb-1">Lupa Kata Sandi</h2>
        <p className="text-sm text-gray-500 mb-6">
          Masukkan Email untuk mengatur ulang kata sandi
        </p>

        {/* Menampilkan error/success message */}
        {error && (
          <div className="text-red-600 text-sm mb-4 text-center">{error}</div>
        )}
        {message && (
          <div className="text-green-600 text-sm mb-4 text-center">{message}</div>
        )}

        {/* Form Input */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              name="email"
              type="email"
              placeholder="Masukkan Email"
              className="w-full px-4 py-2 border rounded-lg text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-sporta-blue text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Atur Ulang Kata Sandi
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
