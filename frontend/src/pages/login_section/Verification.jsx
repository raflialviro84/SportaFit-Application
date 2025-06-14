import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config/api";
import { useNavigate, useLocation } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";

function Verification() {
  const navigate = useNavigate();
  const { state } = useLocation();  // Menangkap email yang dikirimkan dari halaman sebelumnya
  const email = state?.email || "";  // Jika tidak ada, default kosong
  const [resendMessage, setResendMessage] = useState(""); // State untuk pesan kirim ulang
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", ""]); // 5 digit kode

  // Otomatis minta kode verifikasi saat halaman dimuat
  useEffect(() => {
    if (email) {
      handleResendEmail();
    }
  }, []);
  const [errorMessage, setErrorMessage] = useState("");  // Pesan error jika ada

  const handleResendEmail = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal mengirim ulang email.");
      }

      setResendMessage("Kode verifikasi berhasil dikirim ulang! Cek email Anda.");

      // Untuk development, isi otomatis kode verifikasi
      if (data.verificationCode) {
        const codeArray = data.verificationCode.split('');
        setVerificationCode(codeArray);
      }
    } catch (err) {
      setResendMessage("Gagal mengirim ulang kode verifikasi.");
    }
  };

  const handleVerificationChange = (e, index) => {
    const value = e.target.value;
    if (/[^0-9]/.test(value)) return;  // Hanya angka yang diperbolehkan

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
  };

  const handleSubmit = async () => {
    if (verificationCode.join("").length < 5) {
      setErrorMessage("Kode verifikasi tidak lengkap.");
      return;
    }

    try {
      const code = verificationCode.join("");

      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Kode verifikasi tidak valid.");
      }

      // Simpan token untuk digunakan di halaman reset password
      localStorage.setItem("resetToken", data.token);

      // Jika kode verifikasi valid, arahkan ke halaman reset password
      navigate("/new-password", { state: { email, token: data.token } });
    } catch (err) {
      setErrorMessage(err.message || "Gagal memverifikasi kode.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F9FAFB] px-4 py-6">
      <div className="w-full max-w-[434px] min-h-[917px] bg-white rounded-3xl shadow-md p-6 font-jakarta">

        {/* Tombol Kembali */}
        <button
          className="text-sporta-blue text-sm mb-4 flex items-center gap-2"
          onClick={() => navigate("/forgot-password")}
        >
          <IoArrowBack size={20} />
          <span className="font-medium">Kembali</span>
        </button>

        {/* Judul */}
        <h2 className="text-xl font-bold text-black mb-1">Periksa Kotak Email</h2>
        <p className="text-sm text-gray-500 mb-6">
          Kami telah mengirimkan tautan untuk atur ulang kata sandi ke e-mail
          <span className="font-medium text-black"> {email}</span>. Masukkan 5 digit kode yang dikirim ke dalam email!
        </p>

        {/* Menampilkan pesan kirim ulang */}
        {resendMessage && (
          <div className="text-blue-600 text-sm mb-4 text-center">{resendMessage}</div>
        )}

        {/* Menampilkan error */}
        {errorMessage && (
          <div className="text-red-600 text-sm mb-4 text-center">{errorMessage}</div>
        )}

        {/* Input Kode Verifikasi */}
        <div className="flex justify-between gap-2 mb-6">
          {verificationCode.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              className="w-full text-center border rounded-lg py-2 text-lg"
              value={digit}
              onChange={(e) => handleVerificationChange(e, index)}
            />
          ))}
        </div>

        {/* Tombol Verifikasi */}
        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-sporta-blue text-white font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          Verifikasi
        </button>

        {/* Kirim ulang */}
        <p className="text-center text-sm text-gray-500 mt-4">
          Belum menerima pesan Email?
          <button
            className="text-sporta-blue font-bold ml-1 hover:underline"
            onClick={handleResendEmail} // Memanggil fungsi kirim ulang
          >
            Kirim Ulang Pesan Email
          </button>
        </p>
      </div>
    </div>
  );
}

export default Verification;
