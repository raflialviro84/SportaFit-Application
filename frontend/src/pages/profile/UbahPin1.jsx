// src/pages/UbahPin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack, IoEyeOff, IoEye } from 'react-icons/io5';
import { hasPin, updatePin } from '../../services/pinService';

export default function UbahPin() {
  const navigate = useNavigate();
  const [pinLama, setPinLama] = useState('');
  const [pinBaru, setPinBaru] = useState('');
  const [konfirmasiPin, setKonfirmasiPin] = useState('');
  const [showPinLama, setShowPinLama] = useState(false);
  const [showPinBaru, setShowPinBaru] = useState(false);
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pinMismatch, setPinMismatch] = useState(false);

  // Cek apakah user sudah memiliki PIN
  useEffect(() => {
    const checkPin = async () => {
      try {
        const result = await hasPin();

        if (!result) {
          // Jika belum punya PIN, arahkan ke halaman lain
          navigate('/profile');
          alert('Anda belum memiliki PIN. Silakan buat PIN terlebih dahulu saat melakukan pembayaran.');
        }
      } catch (error) {
        console.error('Error checking PIN:', error);
      }
    };

    checkPin();
  }, [navigate]);

  // Real-time validation untuk PIN mismatch
  const handleKonfirmasiPinChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setKonfirmasiPin(value);

    // Check mismatch real-time
    if (value.length > 0 && pinBaru.length > 0) {
      setPinMismatch(pinBaru !== value);
    } else {
      setPinMismatch(false);
    }
  };

  const handlePinBaruChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPinBaru(value);

    // Check mismatch real-time
    if (value.length > 0 && konfirmasiPin.length > 0) {
      setPinMismatch(value !== konfirmasiPin);
    } else {
      setPinMismatch(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validasi input
    if (!pinLama || !pinBaru || !konfirmasiPin) {
      setError('Semua field harus diisi');
      return;
    }

    if (pinLama.length !== 6 || !/^\d+$/.test(pinLama)) {
      setError('PIN lama harus terdiri dari 6 digit angka');
      return;
    }

    if (pinBaru.length !== 6 || !/^\d+$/.test(pinBaru)) {
      setError('PIN baru harus terdiri dari 6 digit angka');
      return;
    }

    if (konfirmasiPin.length !== 6 || !/^\d+$/.test(konfirmasiPin)) {
      setError('Konfirmasi PIN harus terdiri dari 6 digit angka');
      return;
    }

    if (pinBaru !== konfirmasiPin) {
      setError('PIN baru dan konfirmasi PIN tidak cocok. Pastikan kedua PIN sama persis.');
      return;
    }

    if (pinLama === pinBaru) {
      setError('PIN baru harus berbeda dari PIN lama');
      return;
    }

    setLoading(true);

    try {
      // Panggil API untuk mengubah PIN
      const result = await updatePin(pinLama, pinBaru);
      console.log('Update PIN result:', result); // Debug log

      if (result) {
        alert('PIN berhasil diubah');
        navigate(-1); // kembali ke halaman sebelumnya
      } else {
        setError('PIN lama tidak valid');
      }
    } catch (error) {
      console.error('Error updating PIN:', error);
      setError(error.message || 'Terjadi kesalahan saat mengubah PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-[#F9FAFB] px-4 py-6">
      <div className="container max-w-sm sm:max-w-md md:max-w-lg lg:max-w-[434px] w-full bg-white rounded-3xl shadow-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center px-6 py-4 border-b">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <IoArrowBack size={22} />
          </button>
          <h1 className="flex-1 text-center font-jakarta font-bold text-lg">
            Ubah PIN
          </h1>
          <div className="w-6" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 font-jakarta space-y-6 flex-1">
          {/* Hidden username field for accessibility */}
          <input type="text" name="username" autoComplete="username" style={{ display: 'none' }} tabIndex={-1} />
          <p className="text-sm text-gray-700">Silahkan Ubah PIN Anda</p>

          {/* PIN Lama */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              PIN Lama
            </label>
            <div className="relative">
              <input
                type={showPinLama ? 'text' : 'password'}
                value={pinLama}
                onChange={(e) => setPinLama(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123***"
                maxLength={6}
                autoComplete="current-password"
                className="w-full border-b border-gray-300 py-2 pr-8 text-sm focus:outline-none focus:border-sporta-blue"
              />
              <button
                type="button"
                onClick={() => setShowPinLama((v) => !v)}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 text-gray-400"
              >
                {showPinLama ? <IoEye size={20} /> : <IoEyeOff size={20} />}
              </button>
            </div>
          </div>

          {/* PIN Baru */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              PIN Baru
            </label>
            <div className="relative">
              <input
                type={showPinBaru ? 'text' : 'password'}
                value={pinBaru}
                onChange={handlePinBaruChange}
                placeholder="123***"
                maxLength={6}
                autoComplete="new-password"
                className="w-full border-b border-gray-300 py-2 pr-8 text-sm focus:outline-none focus:border-sporta-blue"
              />
              <button
                type="button"
                onClick={() => setShowPinBaru((v) => !v)}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 text-gray-400"
              >
                {showPinBaru ? <IoEye size={20} /> : <IoEyeOff size={20} />}
              </button>
            </div>
          </div>

          {/* Konfirmasi PIN Baru */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Konfirmasi PIN Baru
            </label>
            <div className="relative">
              <input
                type={showKonfirmasi ? 'text' : 'password'}
                value={konfirmasiPin}
                onChange={handleKonfirmasiPinChange}
                placeholder="123***"
                maxLength={6}
                autoComplete="new-password"
                className={`w-full border-b py-2 pr-8 text-sm focus:outline-none ${
                  pinMismatch && konfirmasiPin.length > 0
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-sporta-blue'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowKonfirmasi((v) => !v)}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 text-gray-400"
              >
                {showKonfirmasi ? <IoEye size={20} /> : <IoEyeOff size={20} />}
              </button>
            </div>
            {/* Real-time PIN mismatch warning */}
            {pinMismatch && konfirmasiPin.length > 0 && (
              <div className="text-red-500 text-xs mt-1">
                ⚠️ PIN tidak cocok dengan PIN baru
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Success indicator */}
          {pinBaru.length === 6 && konfirmasiPin.length === 6 && !pinMismatch && (
            <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg border border-green-200">
              ✅ PIN baru dan konfirmasi PIN sudah cocok
            </div>
          )}

          {/* Tombol Simpan */}
          <button
            type="submit"
            disabled={loading || pinMismatch || pinBaru.length !== 6 || konfirmasiPin.length !== 6 || pinLama.length !== 6}
            className={`w-full ${
              loading || pinMismatch || pinBaru.length !== 6 || konfirmasiPin.length !== 6 || pinLama.length !== 6
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-sporta-blue hover:bg-blue-700'
            } text-white py-3 rounded-lg text-base font-semibold transition-colors`}
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </form>
      </div>
    </div>
  );
}
