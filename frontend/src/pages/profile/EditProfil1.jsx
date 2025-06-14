import { useNavigate } from "react-router-dom";
import { IoArrowBack, IoCamera } from "react-icons/io5";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/auth-context";
import UserService from "../../services/userService";

function EditProfil1() {
  const navigate = useNavigate();
  const { updateUserData } = useAuth(); // user dihapus karena tidak dipakai
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    noHP: "",
    tanggalLahir: "",
    photoUrl: ""
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await UserService.getProfile();
        if (response && response.user) {
          const userData = response.user;
          // Pastikan tanggalLahir selalu string 'YYYY-MM-DD'
          let tanggalLahir = "";
          if (userData.birthDate) {
            if (typeof userData.birthDate === "string") {
              // Bisa jadi "YYYY-MM-DD" atau "YYYY-MM-DDTHH:mm:ss.000Z"
              const match = userData.birthDate.match(/^\d{4}-\d{2}-\d{2}/);
              tanggalLahir = match ? match[0] : "";
            } else if (userData.birthDate instanceof Date && !isNaN(userData.birthDate)) {
              tanggalLahir = userData.birthDate.toISOString().slice(0, 10);
            }
          }
          setFormData({
            nama: userData.name || "",
            email: userData.email || "",
            noHP: userData.phone || "",
            tanggalLahir,
            photoUrl: userData.photoUrl || ""
          });
          if (userData.photoUrl) {
            setImagePreview(userData.photoUrl);
          }
        } else {
          throw new Error("Failed to fetch user data");
        }
      } catch {
        setError("Terjadi kesalahan saat memuat data. Silakan coba lagi.");
        setFormData({
          nama: "",
          email: "",
          noHP: "",
          tanggalLahir: ""
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []); // Hanya dijalankan sekali saat mount agar selalu fresh

  const handleChange = (e) => {
    const { name, value } = e.target;
    // For tanggalLahir, always keep YYYY-MM-DD format
    setFormData(prev => ({ ...prev, [name]: name === 'tanggalLahir' ? (value ? value.slice(0, 10) : "") : value }));
  };

  const [imagePreview, setImagePreview] = useState(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError("Hanya file gambar yang diperbolehkan");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran file maksimal 2MB");
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setImagePreview(imageUrl);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setFormData(prev => ({ ...prev, photoUrl: base64String }));
      setSuccess(`Foto profil berhasil diunggah. Klik Simpan untuk menyimpan perubahan.`);
    };
    reader.readAsDataURL(file);

    console.log("Foto profil yang akan diunggah:", file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.nama.trim()) {
      setError("Nama tidak boleh kosong");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email tidak boleh kosong");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Format email tidak valid");
      return;
    }

    try {
      setLoading(true);

      const userData = {
        name: formData.nama,
        email: formData.email,
        phone: formData.noHP,
        birthDate: formData.tanggalLahir ? formData.tanggalLahir.slice(0, 10) : null,
        photoUrl: formData.photoUrl
      };

      if (updateUserData) {
        await updateUserData(userData);
      } else {
        await UserService.updateProfile(userData);
      }

      setSuccess("Profil berhasil diperbarui");
      setTimeout(() => {
        navigate("/profil");
      }, 1000);
    } catch (err) {
      setError(err.message || "Gagal memperbarui profil. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F9FAFB] flex flex-col items-center px-2 pt-4 pb-4">
      <div className="w-full max-w-[434px] bg-white rounded-b-3xl shadow-md flex flex-col overflow-hidden">
        <div className="flex items-center px-4 py-4 border-b bg-white sticky top-0 z-10">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <IoArrowBack size={22} />
          </button>
          <h2 className="flex-1 text-center text-lg font-bold font-jakarta">
            Edit Profil
          </h2>
          <div className="w-6" />
        </div>
        <div className="flex-1 overflow-y-auto p-6 font-jakarta">
          <div className="flex flex-col items-center mb-6">
            <label htmlFor="photo-upload" className="cursor-pointer">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-2 relative overflow-hidden">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Foto Profil"
                    className="w-full h-full object-cover"
                  />
                ) : formData.photoUrl ? (
                  <img
                    src={formData.photoUrl}
                    alt="Foto Profil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <IoCamera size={28} className="text-gray-500" />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <IoCamera size={28} className="text-white" />
                </div>
              </div>
              <p className="text-xs text-gray-600 text-center w-full">Ganti Foto</p>
              <input
                type="file"
                id="photo-upload"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>
          {loading && (
            <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg">
              <p className="text-sm">Memproses...</p>
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg">
              <p className="text-sm">{success}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sporta-blue"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sporta-blue bg-gray-50 cursor-not-allowed"
                required
                readOnly
                tabIndex={-1}
                aria-readonly="true"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                No. HP
              </label>
              <input
                type="tel"
                name="noHP"
                value={formData.noHP}
                onChange={(e) => {
                  const onlyNums = e.target.value.replace(/\D/g, ""); // Hapus semua karakter non-digit
                  handleChange({ target: { name: "noHP", value: onlyNums } });
                }}
                pattern="[0-9]*"
                inputMode="numeric"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sporta-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Tanggal Lahir
              </label>
              <input
                type="date"
                name="tanggalLahir"
                value={formData.tanggalLahir || ""}
                onChange={handleChange}
                min="1900-01-01"
                max="2025-12-31"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sporta-blue"
                placeholder="yyyy-mm-dd"
                pattern="\\d{4}-\\d{2}-\\d{2}"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-sporta-blue text-white py-3 rounded-lg text-base font-semibold hover:bg-blue-700 transition-colors ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditProfil1;
