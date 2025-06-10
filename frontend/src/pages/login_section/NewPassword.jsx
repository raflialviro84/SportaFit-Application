import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";  // useLocation untuk mengambil token
import { IoArrowBack } from "react-icons/io5";

function NewPassword() {
  const navigate = useNavigate();
  const { state } = useLocation();  // Untuk mengambil state dari halaman sebelumnya
  const token = state?.token || localStorage.getItem("resetToken");  // Ambil token dari state atau localStorage
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Validasi untuk memastikan kata sandi baru dan konfirmasi cocok
    if (newPassword !== confirmPassword) {
      setError("Kata sandi dan konfirmasi kata sandi tidak cocok.");
      return;
    }

    // Validasi kata sandi (contoh: minimal 8 karakter, harus ada angka dan huruf)
    if (newPassword.length < 8) {
      setError("Kata sandi harus memiliki minimal 8 karakter.");
      return;
    }

    try {
      if (!token) {
        throw new Error("Token reset tidak ditemukan. Silakan coba lagi.");
      }

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          password: newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal memperbarui kata sandi.");
      }

      setSuccessMessage("Kata sandi berhasil diperbarui. Silakan login dengan kata sandi baru.");

      // Hapus token dari localStorage
      localStorage.removeItem("resetToken");

      // Setelah sukses, arahkan pengguna ke halaman login
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F9FAFB] px-4 py-6">
      <div className="w-full max-w-[434px] min-h-[917px] bg-white rounded-3xl shadow-md p-6 font-jakarta mt-5">

        {/* Tombol Kembali */}
        <button
          className="text-sporta-blue text-sm mb-4 flex items-center gap-2"
          onClick={() => navigate("/verification")}
        >
          <IoArrowBack size={20} />
          <span className="font-medium">Kembali</span>
        </button>

        {/* Judul */}
        <h2 className="text-xl font-bold text-black mb-1">Buat Kata Sandi Baru</h2>
        <p className="text-sm text-gray-500 mb-6">
          Buat kata sandi baru. Pastikan berbeda dari yang sebelumnya demi keamanan.
        </p>

        {/* Menampilkan pesan error atau sukses */}
        {error && <div className="text-red-600 text-sm mb-4 text-center">{error}</div>}
        {successMessage && <div className="text-green-600 text-sm mb-4 text-center">{successMessage}</div>}

        {/* Form Input */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">Kata Sandi Baru</label>
            <input
              type="password"
              placeholder="Masukkan Kata Sandi Baru"
              className="w-full px-4 py-2 border rounded-lg text-sm"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Konfirmasi Kata Sandi baru</label>
            <input
              type="password"
              placeholder="Masukkan kembali kata sandi baru"
              className="w-full px-4 py-2 border rounded-lg text-sm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-sporta-blue text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Perbaharui Kata Sandi
          </button>
        </form>
      </div>
    </div>
  );
}

export default NewPassword;
