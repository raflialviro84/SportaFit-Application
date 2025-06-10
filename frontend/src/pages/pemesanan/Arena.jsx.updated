// src/pages/pemesanan/Arena.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { FiHeart, FiMapPin, FiStar } from "react-icons/fi";
import { useState, useEffect } from "react";
import { ArenaService } from "../../services/apiService";

// Data sementara jika API belum siap
const mockArenas = [
  {
    id: 1,
    name: "Arena Victory Badminton",
    address: "Jl. Merdeka No.10",
    city: "Surabaya",
    image_url: "/foto_lapangan.png",
    rating: 4.5,
    reviews_count: 123,
  },
  {
    id: 2,
    name: "Lapangan Bintang Sport",
    address: "Jl. Pahlawan No.22",
    city: "Surabaya",
    image_url: "/foto_lapangan1.jpg",
    rating: 4.2,
    reviews_count: 87,
  },
  {
    id: 3,
    name: "ZUPER KEPUTIH",
    address: "Jl. Keputih No.15",
    city: "Surabaya",
    image_url: "/foto_lapangan2.jpg",
    rating: 4.7,
    reviews_count: 156,
  },
  {
    id: 4,
    name: "ZUPER DHARMAHUSADA",
    address: "Jl. Dharmahusada No.30",
    city: "Surabaya",
    image_url: "/foto_lapangan3.jpg",
    rating: 4.6,
    reviews_count: 112,
  }
];

function Arena() {
  const navigate = useNavigate();
  const location = useLocation();
  const [arenas, setArenas] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Parse query parameters
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search');
  const city = searchParams.get('city');

  useEffect(() => {
    const fetchArenas = async () => {
      try {
        setLoading(true);
        
        try {
          // Gunakan API service untuk mengambil data
          const data = await ArenaService.getAllArenas(searchQuery, city);
          console.log("Arena data from API:", data);
          
          if (data && data.length > 0) {
            setArenas(data);
          } else if (searchQuery || city) {
            // Jika pencarian tidak menemukan hasil, filter mockArenas
            const filtered = mockArenas.filter(arena => {
              const matchesQuery = searchQuery ? 
                arena.name.toLowerCase().includes(searchQuery.toLowerCase()) : true;
              const matchesCity = city ? 
                arena.city.toLowerCase() === city.toLowerCase() : true;
              return matchesQuery && matchesCity;
            });
            setArenas(filtered);
          } else {
            // Jika tidak ada hasil dan tidak ada pencarian, tampilkan semua arena mock
            setArenas(mockArenas);
          }
        } catch (apiError) {
          console.error("API Error:", apiError);
          console.log("Using mock data instead");
          
          // Jika API gagal, gunakan data mock
          if (searchQuery || city) {
            const filtered = mockArenas.filter(arena => {
              const matchesQuery = searchQuery ? 
                arena.name.toLowerCase().includes(searchQuery.toLowerCase()) : true;
              const matchesCity = city ? 
                arena.city.toLowerCase() === city.toLowerCase() : true;
              return matchesQuery && matchesCity;
            });
            setArenas(filtered);
          } else {
            // Jika tidak ada pencarian, tampilkan semua arena mock
            setArenas(mockArenas);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error in fetchArenas:", err);
        setArenas(mockArenas);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchArenas();
  }, [searchQuery, city]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] px-4 pt-6 pb-24">
      <div className="max-w-[434px] mx-auto space-y-5 font-jakarta">
        {/* Header */}
        <div className="flex items-center mb-4">
          <button onClick={() => navigate("/home")} className="p-2 text-gray-600">
            <IoArrowBack size={24} />
          </button>
          <h1 className="flex-1 text-center text-xl font-bold">
            {searchQuery ? `Hasil Pencarian: ${searchQuery}` : "Daftar Arena"}
          </h1>
          <div className="w-6" />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            <p>Terjadi kesalahan: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm underline"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && arenas.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">Tidak ada arena yang ditemukan</p>
            {searchQuery && (
              <button
                onClick={() => navigate('/arena')}
                className="mt-2 text-blue-500 underline"
              >
                Lihat semua arena
              </button>
            )}
          </div>
        )}

        {/* Overlay Cards */}
        {!loading && !error && arenas.map((arena) => (
          <div
            key={arena.id}
            className="relative h-[250px] rounded-2xl overflow-hidden mb-4 cursor-pointer"
            onClick={() => navigate(`/arena/${arena.id}`)}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-center bg-cover"
              style={{ backgroundImage: `url(${arena.image_url || arena.img || '/foto_lapangan.png'})` }}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Text Overlay */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex justify-between items-start">
                <h2 className="text-lg font-semibold drop-shadow-lg">
                  {arena.name}
                </h2>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Mencegah event klik menyebar ke parent
                    // Logika untuk menambahkan ke favorit bisa ditambahkan di sini
                  }}
                  className="bg-black/40 p-2 rounded-full"
                >
                  <FiHeart size={18} className="text-white" />
                </button>
              </div>
              <div className="flex items-center text-sm mt-1 drop-shadow-md">
                <FiMapPin className="mr-1" />
                {arena.address}{arena.city ? `, ${arena.city}` : ''}
              </div>
              <div className="flex items-center text-sm mt-1 drop-shadow-md">
                <FiStar className="text-yellow-400 mr-1" />
                <span className="font-semibold">{arena.rating}</span>
                <span className="ml-2">({arena.reviews_count || arena.reviews || 0} ulasan)</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Arena;
