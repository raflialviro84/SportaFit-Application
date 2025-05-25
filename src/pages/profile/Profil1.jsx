// src/pages/profile/Profil1.jsx

import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { IoArrowBack, IoChevronForward, IoPersonOutline, IoTicketOutline, IoNotificationsOutline, IoPersonRemoveOutline, IoKeyOutline, IoShieldCheckmarkOutline, IoHelpCircleOutline, IoCallOutline } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../context/auth-context";
import UserService from "../../services/userService";

function Profil1() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  // Ambil data user dari backend jika belum ada di context
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Only use user from context
        if (user) {
          setUserData(user);
          return;
        }
        // If not in context, fetch from backend
        const response = await UserService.getProfile();
        if (response && response.user) {
          setUserData(response.user);
        } else {
          throw new Error("Failed to fetch user data");
        }
      } catch (err) {
        setError("Terjadi kesalahan saat memuat data. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user]);

  // Fungsi untuk handle logout
  const handleLogout = () => {
    try {
      logout();
    } catch (err) {
      setError("Gagal logout. Silakan coba lagi.");
    }
  };

  // Fungsi untuk menangani klik pada menu
  const handleMenuClick = (label) => {
    switch (label) {
      case "Edit Profil":
        navigate("/edit-profil");
        break;
      case "Voucher":
        navigate("/voucher");
        break;
      case "Pemberitahuan":
        navigate("/pemberitahuan");
        break;
      case "Hapus Akun": // Changed from "Non‑aktifkan Akun"
        navigate("/hapus-akun"); // Changed from "/nonaktif-akun"
        break;
      case "Ubah PIN":
        navigate("/ubah-pin");
        break;
      case "Kebijakan Privasi":
        navigate("/kebijakan-privasi");
        break;
      case "FAQ":
        navigate("/faq");
        break;
      case "Kontak Kami":
        // Implementasi kontak kami
        window.open("mailto:support@sportafit.com", "_blank");
        break;
      default:
        console.log(`Menu ${label} diklik`);
    }
  };

  // data menu
  const sections = [
    {
      title: "Akun",
      items: [
        { label: "Edit Profil", icon: <IoPersonOutline size={20} /> },
        { label: "Voucher", icon: <IoTicketOutline size={20} /> },
        { label: "Pemberitahuan", icon: <IoNotificationsOutline size={20} /> },
        { label: "Hapus Akun", icon: <IoPersonRemoveOutline size={20} /> },
      ],
    },
    {
      title: "Keamanan",
      items: [
        { label: "Ubah PIN", icon: <IoKeyOutline size={20} /> },
        { label: "Kebijakan Privasi", icon: <IoShieldCheckmarkOutline size={20} /> },
      ],
    },
    {
      title: "Tentang Kami",
      items: [
        { label: "FAQ", icon: <IoHelpCircleOutline size={20} /> },
        { label: "Kontak Kami", icon: <IoCallOutline size={20} /> },
      ],
    },
  ];

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-[#F9FAFB] px-4 py-6">
      <div className="container max-w-sm sm:max-w-md md:max-w-lg lg:max-w-[434px] w-full bg-white rounded-3xl shadow-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center px-6 py-4 border-b">
          <button onClick={() => navigate(-1)} className="text-sporta-blue">
            <IoArrowBack size={24} />
          </button>
          <h2 className="flex-1 text-center text-xl font-bold font-jakarta text-black">Profil</h2>
          {/* placeholder untuk rata tengah */}
          <div style={{ width: 24 }} />
        </div>

        {/* Konten */}
        <div className="flex-1 overflow-y-auto font-jakarta">
          {/* Error Message */}
          {error && (
            <div className="px-6 py-3 mb-2 bg-red-50 text-red-700 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Info Pengguna */}
          <div className="flex items-center gap-4 px-6 py-6 border-b">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {userData && userData.photoUrl ? (
                <img
                  src={userData.photoUrl}
                  alt="Foto Profil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUserCircle size={64} className="text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ) : error ? (
                <div className="text-red-500 text-sm">
                  <div>Error loading profile data</div>
                  <button
                    onClick={() => window.location.reload()}
                    className="underline text-blue-500 mt-1"
                  >
                    Refresh
                  </button>
                </div>
              ) : userData ? (
                <>
                  <div className="text-lg font-semibold text-black">{userData.name || "Nama tidak tersedia"}</div>
                  <div className="text-sm text-black">{userData.email || "Email tidak tersedia"}</div>
                  <div className="text-sm text-black">{userData.phone || "Nomor telepon belum diatur"}</div>
                  {userData.birthDate && (
                    <div className="text-sm text-black">Tanggal Lahir: {userData.birthDate}</div>
                  )}
                </>
              ) : (
                <>
                  <div className="text-lg font-semibold text-black">Pengguna</div>
                  <div className="text-sm text-black">Email tidak tersedia</div>
                  <div className="text-sm text-black">Nomor telepon tidak tersedia</div>
                </>
              )}
            </div>
          </div>

          {/* Sections */}
          <div className="px-6 py-6 space-y-6">
            {sections.map((section, sIdx) => (
              <div key={sIdx}>
                <div className="text-sm font-semibold text-black mb-3">
                  {section.title}
                </div>
                <div className="space-y-3">
                  {section.items.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleMenuClick(item.label)}
                      className="w-full flex items-center justify-between py-3 border-b border-gray-200"
                    >
                      <div className="flex items-center gap-4 text-black">
                        {item.icon}
                        <span className="text-base">{item.label}</span>
                      </div>
                      <IoChevronForward size={20} className="text-black" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Tombol Logout */}
          <div className="px-6 pt-4 pb-8">
            <button
              onClick={handleLogout}
              className="w-full py-3 border border-red-500 text-red-500 rounded-xl font-semibold hover:bg-red-50 transition-colors"
            >
              Keluar
            </button>
          </div>

          {/* Versi Aplikasi */}
          <div className="text-center text-sm text-black py-4">
            V1.1.10
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profil1;
