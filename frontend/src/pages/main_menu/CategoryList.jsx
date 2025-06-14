import { useNavigate } from "react-router-dom";

function CategoryList() {
  const navigate = useNavigate();
    return (
      // Container abu‑abu penuh layar
      <div className="w-full bg-gray-50 py-6 relative">
        {/* Konten dibatasi max‑width 434px dan di‑center */}
        <div className="max-w-[434px] mx-auto px-4">
          {/* Judul */}
          <h2 className="text-sporta-blue text-sm font-semibold mb-4">
            Mau Olahraga dimana hari ini?
          </h2>

          {/* Card Badminton */}
          <div
            className="relative w-full rounded-2xl overflow-hidden cursor-pointer"
            onClick={() => navigate("/arena")}
          >
            <img
              src="/lapangan-badminton.png"
              alt="Lapangan Badminton"
              className="w-full h-[230px] object-cover"
            />
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering parent onClick
                navigate("/arena");
              }}
              className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white py-2 text-sm font-semibold hover:bg-opacity-70 transition-all"
            >
              Booking Sekarang
            </button>
          </div>

          {/* Slogan */}
          <div className="text-center mt-5">
            <h3 className="text-[16px] font-bold text-black">BADMINTON</h3>
            <p className="text-sm text-gray-600 mt-1">
              Lapangan Favoritmu, Siap Dalam Sekejap!
            </p>
          </div>
        </div>

        {/* ↓ Shadow separator di bagian bawah CategoryList */}
        <div className="absolute bottom-0 left-0 right-0 h-4 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-t from-gray-200 to-transparent" />
        </div>
      </div>
    );
  }

  export default CategoryList;
