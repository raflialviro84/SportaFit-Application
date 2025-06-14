import { useNavigate } from "react-router-dom";

function Hero() {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-12 bg-gradient-to-b from-sporta-blue to-sporta-dark text-white">
      {/* Logo */}
      <img src="/Logo.png" alt="Logo Sporta Fit" className="w-28 mb-6" />

      {/* Judul & Deskripsi */}
      <h1 className="text-2xl font-bold mb-2">SELAMAT DATANG DI SPORTA FIT</h1>
      <p className="mb-6 uppercase text-sm tracking-wide">
        Cari lapangan badminton favoritmu & pesan sekarang!
      </p>

      {/* Tombol CTA */}
      <button
        onClick={() => navigate("/login")}
        className="bg-white text-sporta-blue font-semibold py-3 px-6 rounded-full shadow hover:bg-gray-100 transition"
      >
        Booking
      </button>
    </section>
  );
}

export default Hero;
