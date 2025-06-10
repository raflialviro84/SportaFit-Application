import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { useAuth } from '../../context/auth-context'; // Added import
import UserService from '../../services/userService'; // Added import

export default function HapusAkun() { // Renamed component
  const navigate = useNavigate();
  const { logout } = useAuth(); // Added useAuth hook

  const handleDelete = async () => { // Made function async
    try {
      // Panggil API hapus akun di sini
      await UserService.deleteAccount(); // Assuming deleteAccount exists in UserService
      
      // Logout pengguna
      logout();
      
      alert('Akun Anda berhasil dihapus.');
      navigate('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      // Handle error, misalnya tampilkan pesan ke pengguna
      alert('Gagal menghapus akun. Silakan coba lagi.');
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
            Konfirmasi Hapus Akun
          </h1>
          <div className="w-6" />
        </div>

        {/* Pesan Konfirmasi */}
        <div className="p-6 font-jakarta text-sm text-gray-700 leading-relaxed flex-1">
          <p>
            Apakah kamu yakin ingin menghapus akunmu? Kalau kamu menghapus akun,
            kamu akan kehilangan seluruh data yang tersimpan di dalam aplikasi
            dan harus membuat ulang akun baru sebagai pengguna baru.
          </p>
        </div>

        {/* Tombol Hapus */}
        <div className="px-6 pb-6">
          <button
            onClick={handleDelete}
            className="w-full text-center text-red-600 font-semibold py-3 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            HAPUS AKUN
          </button>
        </div>
      </div>
    </div>
  );
}
