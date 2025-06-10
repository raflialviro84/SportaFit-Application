import { useNavigate, useParams } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { FiMapPin, FiStar } from "react-icons/fi";
import { useState, useEffect } from "react";
import { ArenaService } from "../../services/apiService";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

// Custom CSS for Swiper pagination
const swiperStyles = `
  .swiper-pagination {
    position: relative;
    bottom: 0 !important;
    z-index: 10;
  }

  .swiper-pagination-bullet {
    background: #ccc;
    opacity: 0.6;
  }

  .swiper-pagination-bullet-active {
    background: #0066FF;
    opacity: 1;
  }
`;

// Static images for the arena - CHANGE THESE IMAGES AS NEEDED
const arenaImages = [
  "/foto_lapangan.png",  // Default image
  "/foto_lapangan1.jpg", // You can change these paths to your actual image files
  "/foto_lapangan2.jpg"  // Add more or remove images as needed
];

// Testimonials data
const testimonials = [
  {
    name: "Budi Santoso",
    role: "Member Reguler",
    rating: 5,
    text: "Lapangan badminton terbaik di kota! Lantai kayu berkualitas tinggi, pencahayaan sempurna, dan staf yang ramah. Saya bermain di sini setiap minggu dan selalu puas.",
    image: "https://randomuser.me/api/portraits/men/1.jpg"
  },
  {
    name: "Siti Rahayu",
    role: "Atlet Badminton",
    rating: 4,
    text: "Fasilitas lengkap dan terawat dengan baik. Saya suka bermain di sini karena lapangannya sesuai standar kompetisi. Hanya saja kadang ramai di akhir pekan.",
    image: "https://randomuser.me/api/portraits/women/2.jpg"
  },
  {
    name: "Agus Wijaya",
    role: "Pelatih Badminton",
    rating: 5,
    text: "Tempat ideal untuk latihan tim. Saya membawa murid-murid saya ke sini untuk latihan rutin. Lapangan berkualitas dan area tunggu yang nyaman untuk orang tua.",
    image: "https://randomuser.me/api/portraits/men/3.jpg"
  },
  {
    name: "Dewi Lestari",
    role: "Pemain Kasual",
    rating: 4,
    text: "Harga terjangkau untuk kualitas lapangan yang ditawarkan. Saya dan teman-teman selalu booking di sini untuk bermain di akhir pekan.",
    image: "https://randomuser.me/api/portraits/women/4.jpg"
  }
];

// Fallback data jika API gagal
const mockArena = {
  name: "Arena Victory Badminton",
  address: "Jl. Merdeka No.10, Surabaya",
  rating: 4.5,
  reviews_count: 123,
  opening_hours: "08.00 - 22.00 WIB",
  image_url: "/foto_lapangan.png",
  price_per_hour: 80000,
  facilities: ["Shower", "Toilet", "Kantin", "Parkir"],
  description:
    "Lapangan badminton indoor berstandar nasional. Lantai kayu, pencahayaan optimal, dan ruang ganti yang bersih. Cocok untuk latihan, komunitas, atau turnamen di pusat kota Surabaya.",
  policies: [
    "Dimohon Tidak Membawa Makanan dan Minuman dari luar Arena",
    "Dilarang Merokok / Vape di Area Badminton",
    "Wajib Memakai Sepatu Olahraga Badminton & Baju Olahraga",
    "Dilarang Meludah Atau Membuang Ingus di Area Badminton",
    "Jaga Barang Anda, Kehilangan Bukan Tanggung Jawab Kami",
  ],
};

function DetailArena() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showAllPolicy, setShowAllPolicy] = useState(false);
  const [arena, setArena] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArenaDetails = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error state

        const data = await ArenaService.getArenaById(id);
        console.log("Arena data from API:", data);

        if (!data) {
          throw new Error("Tidak dapat memuat data arena");
        }

        setArena(data);
      } catch (err) {
        console.error("Error fetching arena details:", err);
        setError(err.message || "Terjadi kesalahan saat memuat data arena");
        // Fallback ke data mock jika API gagal
        setArena(mockArena);
      } finally {
        setLoading(false);
      }
    };

    fetchArenaDetails();
  }, [id]);

  // Format harga ke format Rupiah
  const formatPrice = (price) => {
    if (!price) return 'Rp 0 /Jam';
    return `Rp ${price.toLocaleString('id-ID')} /Jam`;
  };

  // Log untuk debugging
  console.log('Arena data:', arena);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sporta-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data arena...</p>
        </div>
      </div>
    );
  }

  if (error && !arena) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/arena")}
            className="bg-sporta-blue text-white py-2 px-4 rounded-lg"
          >
            Kembali ke Daftar Arena
          </button>
        </div>
      </div>
    );
  }

  // Gunakan data dari API atau fallback ke mockArena
  const policies = arena?.policies || mockArena.policies || [];
  const facilities = arena?.facilities || mockArena.facilities || [];

  // Log harga untuk debugging
  console.log('Price in detail arena:', {
    price: arena?.price_per_hour,
    formattedPrice: formatPrice(arena?.price_per_hour)
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB] px-4 pt-6 pb-20 font-jakarta">
      {/* Apply custom styles for Swiper */}
      <style>{swiperStyles}</style>
      {/* Header */}
      <div className="flex items-center mb-4">
        <button onClick={() => navigate("/arena")} className="p-2 text-gray-600">
          <IoArrowBack size={24} />
        </button>
        <h1 className="flex-1 text-center text-xl font-bold">Detail Lapangan</h1>
        <div className="w-6" />
      </div>

      {/* Hero Images with Horizontal Scroll */}
      {/* To change images, edit the arenaImages array at the top of this file */}
      <div className="mb-6">
        <Swiper
          modules={[Pagination]}
          spaceBetween={10}
          slidesPerView={1}
          pagination={{ clickable: true }}
          className="rounded-2xl overflow-hidden h-[200px]"
        >
          {/* Use static images defined at the top of the file */}
          {arenaImages.map((imagePath, index) => (
            <SwiperSlide key={index}>
              <img
                src={imagePath}
                alt={`${arena?.name || mockArena.name} - Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Section 1: Rating, Jam, Lokasi */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center text-base">
          <FiStar className="text-yellow-500 mr-1" />
          <span className="font-bold">{arena?.rating || mockArena.rating}</span>
          <span className="ml-2 text-gray-500 text-sm">({arena?.reviews_count || mockArena.reviews_count} ulasan)</span>
        </div>
        <div className="flex items-center text-gray-700 text-sm">
          <span className="mr-2">🕒</span>
          {arena?.opening_hours || mockArena.opening_hours}
        </div>
        <div className="flex items-center text-gray-700 text-sm">
          <FiMapPin className="mr-2" />
          {arena?.address || mockArena.address}
        </div>
      </div>
      <hr className="my-4 border-gray-200" />

      {/* Section 2: Deskripsi */}
      <div className="mb-4">
        <div className="text-sm font-semibold text-gray-900 mb-1">Deskripsi Lapangan</div>
        <p className="text-xs text-gray-700">{arena?.description || mockArena.description}</p>
      </div>
      <hr className="my-4 border-gray-200" />

      {/* Section 3: Fasilitas */}
      <div className="mb-4">
        <div className="text-sm font-semibold text-gray-900 mb-2">Fasilitas</div>
        <div className="flex flex-wrap gap-2">
          {facilities.map((facility, i) => (
            <span key={i} className="bg-blue-100 text-blue-800 text-xs font-semibold py-1 px-3 rounded-full">
              {facility}
            </span>
          ))}
        </div>
      </div>
      <hr className="my-4 border-gray-200" />

      {/* Section 4: Kebijakan */}
      <div className="mb-4">
        <div className="text-sm font-semibold text-gray-900 mb-1">Kebijakan Arena</div>
        <ul className="text-xs text-gray-700 space-y-1 mb-2">
          {(showAllPolicy ? policies : policies.slice(0, 3)).map((p, i) => (
            <li key={i}>{i + 1}. {p}</li>
          ))}
        </ul>
        {!showAllPolicy && policies.length > 3 && (
          <div className="flex justify-center mt-2">
            <button className="text-blue-600 text-xs font-semibold"
              onClick={() => setShowAllPolicy(true)}>
              Selengkapnya
            </button>
          </div>
        )}
      </div>
      <hr className="my-4 border-gray-200" />

      {/* Section 5: Gabung Member */}
      <div className="mb-6">
        <div className="text-sm font-semibold text-gray-900 mb-1">Gabung Member</div>
        <p className="text-xs text-gray-700">
          Ingin bermain rutin di arena ini? Daftar jadi member club untuk dapat jadwal khusus dan promo menarik. Cek info di bagian admin arena.
        </p>
      </div>

      {/* Section: Ulasan Pengguna */}
      <div className="mb-6 relative z-0">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Ulasan Pengguna</h2>
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={16}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000 }}
          breakpoints={{
            768: { slidesPerView: 2 },
          }}
          className="pb-8 relative z-0"
        >
          {testimonials.map((t, i) => (
            <SwiperSlide key={i}>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-md flex flex-col justify-between h-full">
                {/* Rating */}
                <div className="flex gap-1 mb-4 text-amber-500">
                  {[...Array(t.rating)].map((_, idx) => (
                    <svg
                      key={idx}
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      viewBox="0 0 18 17"
                      fill="currentColor"
                    >
                      <path d="M8.103 1.317c.367-.743 1.427-.743 1.794 0l1.81 3.666a1 1 0 0 0 .753.548l4.046.588c.82.119 1.148 1.127.555 1.705l-2.928 2.854a1 1 0 0 0-.287.89l.691 4.03c.14.817-.718 1.44-1.451 1.055l-3.619-1.903a1 1 0 0 0-.94 0l-3.62 1.903c-.733.385-1.59-.238-1.45-1.055l.69-4.03a1 1 0 0 0-.287-.89L.94 7.824c-.593-.578-.265-1.586.555-1.705l4.047-.588a1 1 0 0 0 .753-.548L8.103 1.317Z" />
                    </svg>
                  ))}
                </div>

                {/* Review Text (Potong jika terlalu panjang) */}
                <p className="text-gray-600 text-xs leading-5 mb-3 italic">
                  {t.text.split(' ').length > 15
                    ? `"${t.text.split(' ').slice(0, 15).join(' ')}..."`
                    : `"${t.text}"`}
                </p>

                {/* User Info */}
                <div className="flex items-center gap-4 mt-auto">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h5 className="text-gray-900 font-semibold text-sm">{t.name}</h5>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg py-3 px-4 z-50 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-700">
            <span className="block font-semibold">{formatPrice(arena?.price_per_hour || mockArena.price_per_hour)}</span>
            <span className="text-xs text-gray-500">
              1 Jam / Lapangan
            </span>
          </div>
          <button
            onClick={() => navigate(`/lapangan-booking/${id}`)}
            className="bg-sporta-blue text-white py-2 px-4 rounded-lg"
          >
            Lihat Jadwal
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetailArena;
