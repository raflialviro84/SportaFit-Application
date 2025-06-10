import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { savePin } from "../../services/pinService";

export default function SetUpPin() {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      setError("PIN harus terdiri dari 6 digit angka");
      return;
    }
    if (pin !== confirmPin) {
      setError("PIN dan konfirmasi PIN tidak cocok");
      return;
    }
    setLoading(true);
    try {
      const success = await savePin(pin);
      if (success) {
        alert("PIN berhasil disimpan!");
        navigate(-1);
      } else {
        setError("Gagal menyimpan PIN. Silakan coba lagi.");
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4 py-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-md p-6">
        <h1 className="text-xl font-bold text-center mb-6">Set-Up PIN</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">PIN Baru</label>
            <input
              type="password"
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              className="w-full border-b border-gray-300 py-2 text-lg text-center tracking-widest focus:outline-none focus:border-sporta-blue"
              placeholder="******"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Konfirmasi PIN</label>
            <input
              type="password"
              value={confirmPin}
              onChange={e => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              className="w-full border-b border-gray-300 py-2 text-lg text-center tracking-widest focus:outline-none focus:border-sporta-blue"
              placeholder="******"
            />
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sporta-blue text-white py-3 rounded-lg font-semibold text-base hover:bg-blue-700 transition-colors"
          >
            {loading ? "Menyimpan..." : "Simpan PIN"}
          </button>
        </form>
      </div>
    </div>
  );
}
