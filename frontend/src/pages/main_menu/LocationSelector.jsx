import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLocation } from "../../context/LocationContext"; // ✅
import { useState } from "react";
import { IoLocationOutline } from "react-icons/io5";

const locations = [
  "Ambon", "Bali", "Balikpapan", "Bandung", "Banjarbaru", "Banjarmasin",
  "Batam", "Baubau", "Bekasi", "Bengkulu", "Binjai", "Surabaya", "Sidoarjo", "Blitar",
  "Bogor", "Bondowoso", "Cianjur", "Cikarang", "Jakarta", "Semarang",
];

function LocationSelector() {
  const navigate = useNavigate();
  const { setLocation } = useLocation(); // ✅
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-[917px] w-full max-w-[434px] mx-auto bg-[#F9FAFB] flex flex-col font-jakarta"
    >
      {/* Header */}
      <div className="bg-white p-4 flex items-center gap-3 shadow rounded-b-xl">
        <button onClick={() => navigate(-1)}>
          <IoArrowBack size={22} />
        </button>
        <h1 className="text-sm font-medium">Pilih Lokasi</h1>
      </div>

      {/* List lokasi */}
      <div className="flex-1 overflow-y-auto">
        {locations.map((city, i) => (
          <div
            key={i}
            className="border-b px-5 py-3 text-sm hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              setLocation(city.toUpperCase()); // ✅ set dan navigate
              navigate("/home");
            }}
          >
            {city.toUpperCase()}
          </div>
        ))}

        {/* Tombol Lokasi */}
        <div className="sticky bottom-0 bg-gradient-to-t from-[#F9FAFB] to-transparent pt-5 pb-8 flex flex-col items-center">
          {error && (
            <div className="text-red-500 text-xs mb-2 text-center px-4">
              {error}
            </div>
          )}
          <button
            className={`flex items-center gap-2 bg-sporta-blue text-white px-6 py-3 rounded-xl text-sm font-semibold ${loading ? 'opacity-70' : ''}`}
            onClick={() => {
              setLoading(true);
              setError(null);

              if (!navigator.geolocation) {
                setError("Geolokasi tidak didukung oleh browser Anda");
                setLoading(false);
                return;
              }

              navigator.geolocation.getCurrentPosition(
                async (position) => {
                  try {
                    // Dapatkan koordinat
                    const { latitude, longitude } = position.coords;

                    // Gunakan Geocoding API untuk mendapatkan nama kota
                    const response = await fetch(
                      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
                    );

                    if (!response.ok) {
                      throw new Error("Gagal mendapatkan lokasi");
                    }

                    const data = await response.json();

                    // Ekstrak nama kota dari respons
                    const city = data.address.city ||
                                data.address.town ||
                                data.address.village ||
                                data.address.county ||
                                "LOKASI SAYA";

                    setLocation(city.toUpperCase());
                    setLoading(false);
                    navigate("/home");
                  } catch (err) {
                    console.error("Error getting location:", err);
                    setError("Gagal mendapatkan lokasi Anda");
                    setLoading(false);
                  }
                },
                (err) => {
                  console.error("Geolocation error:", err);
                  let errorMessage = "Gagal mendapatkan lokasi Anda";

                  if (err.code === 1) {
                    errorMessage = "Akses lokasi ditolak. Mohon izinkan akses lokasi";
                  } else if (err.code === 2) {
                    errorMessage = "Lokasi tidak tersedia";
                  } else if (err.code === 3) {
                    errorMessage = "Waktu permintaan lokasi habis";
                  }

                  setError(errorMessage);
                  setLoading(false);
                },
                {
                  enableHighAccuracy: true,
                  timeout: 10000,
                  maximumAge: 0
                }
              );
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Mendapatkan Lokasi...</span>
              </>
            ) : (
              <>
                <IoLocationOutline size={18} />
                <span>Gunakan Lokasi Saya</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default LocationSelector;
