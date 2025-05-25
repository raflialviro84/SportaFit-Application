import { useNavigate } from "react-router-dom";

function Done() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F9FAFB] px-4 py-6">
      <div className="w-full max-w-[434px] min-h-[917px] bg-white rounded-3xl shadow-md p-6 font-jakarta flex flex-col items-center justify-start pt-32">
        {/* Ikon dan Pesan */}
        <img src="/ikon_centang.png" alt="Berhasil" className="w-16 h-16 mb-4" />
        <h2 className="text-xl font-bold text-black mb-2">Berhasil</h2>
        <p className="text-center text-sm text-gray-600 mb-6">
          Selamat! Kata sandi Anda telah berhasil diubah. <br />
          Klik lanjutkan untuk masuk.
        </p>

        {/* Tombol */}
        <button
          onClick={() => navigate("/login")}
          className="w-full py-3 bg-sporta-blue text-white font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          Lanjutkan
        </button>
      </div>
    </div>
  );
}

export default Done;
