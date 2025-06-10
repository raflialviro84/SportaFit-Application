import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5"; // pastikan sudah install react-icons

function PersonalData() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#F9FAFB] px-4 py-6">
      <div className="container max-w-sm w-full bg-white rounded-3xl shadow-md flex flex-col p-6 font-jakarta">

        {/* Tombol Kembali */}
        <button
          className="text-sporta-blue text-sm mb-4 flex items-center gap-2"
          onClick={() => navigate("/register")}
        >
          <IoArrowBack size={20} />
          <span className="font-medium">Kembali</span>
        </button>

        {/* Judul (rata kiri) */}
        <h2 className="text-[18px] sm:text-[20px] font-bold text-black mb-4 leading-snug">
          KEBIJAKAN PRIVASI & SYARAT PENGGUNAAN SPORTA FIT
        </h2>

        {/* Box Scroll */}
        <div className="border-2 border-dashed border-purple-400 rounded-xl p-4 h-[589px] overflow-y-auto space-y-4 text-sm text-gray-700 leading-relaxed">

          <div>
            <h3 className="text-sporta-blue font-bold mb-1">1. Definisi</h3>
            <p>
              <strong>Sporta Fit</strong>: Aplikasi untuk pemantauan kebugaran, pencatatan aktivitas olahraga, dan gaya hidup sehat. <br />
              <strong>Pengguna</strong>: Individu yang melakukan registrasi aplikasi. <br />
              <strong>Data Pribadi</strong>: Nama, email, no. telepon, biometrik, dan data lain. <br />
              <strong>Keanggotaan</strong>: Status pengguna (gratis/premium). <br />
              <strong>Transaksi</strong>: Aktivitas pembayaran dan fitur tambahan lainnya.
            </p>
          </div>

          <div>
            <h3 className="text-sporta-blue font-bold mb-1">2. Ketentuan Umum</h3>
            <ul className="list-disc ml-4">
              <li>Kebijakan berlaku untuk semua pengguna.</li>
              <li>Pendaftaran dianggap menyetujui isi kebijakan ini.</li>
              <li>Sporta Fit dapat mengubah kebijakan sewaktu-waktu dengan pemberitahuan.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sporta-blue font-bold mb-1">3. Persyaratan Keanggotaan</h3>
            <ul className="list-disc ml-4">
              <li>Minimal usia 17 tahun dengan izin orang tua.</li>
              <li>Data pendaftaran harus akurat dan terkini.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sporta-blue font-bold mb-1">4. Registrasi Sporta Fit</h3>
            <p>
              Untuk mendaftar, pengguna harus mengisi data pribadi atau login melalui Google, Apple, atau Facebook. 
              Pengguna wajib memberi izin kepada Sporta Fit untuk mengelola data pribadi.
            </p>
          </div>

          <div>
            <h3 className="text-sporta-blue font-bold mb-1">5. Aktivasi Status</h3>
            <p>
              Setelah mendaftar, pengguna akan menerima email verifikasi. Jika tidak diaktivasi dalam 48 jam, akun bisa ditangguhkan.
            </p>
          </div>

          <div>
            <h3 className="text-sporta-blue font-bold mb-1">6. Pengamanan Transaksi</h3>
            <p>
              Sporta Fit menggunakan enkripsi untuk melindungi transaksi. Semua transaksi bersifat final, kecuali terbukti ada kesalahan sistem.
            </p>
          </div>

          <div>
            <h3 className="text-sporta-blue font-bold mb-1">7. Penggunaan Aplikasi</h3>
            <ul className="list-disc ml-4">
              <li>Diperbolehkan hanya untuk keperluan pribadi.</li>
              <li>Dilarang untuk penyalahgunaan atau tindakan ilegal.</li>
              <li>Pelanggaran dapat menyebabkan pemblokiran akun.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sporta-blue font-bold mb-1">8. Pelayanan dan Pengaduan</h3>
            <p>
              Pengaduan dapat dilakukan melalui email dan akan diproses maksimal 5 hari kerja.
            </p>
          </div>

          <div>
            <h3 className="text-sporta-blue font-bold mb-1">9. Ketentuan Penggunaan Aplikasi</h3>
            <p>
              Pengguna wajib menjaga kerahasiaan akun. Sporta Fit dapat memperbarui fitur tanpa pemberitahuan sebelumnya.
            </p>
          </div>

          <div>
            <h3 className="text-sporta-blue font-bold mb-1">10. Potensi Risiko</h3>
            <p>
              Sporta Fit tidak bertanggung jawab atas cedera yang terjadi akibat penggunaan aplikasi. Konsultasi dengan dokter disarankan.
            </p>
          </div>

          <div>
            <h3 className="text-sporta-blue font-bold mb-1">11. Lain-lain</h3>
            <p>
              Segala sengketa diselesaikan secara musyawarah. Kebijakan ini tunduk pada hukum yang berlaku di wilayah operasional.
            </p>
          </div>
        </div>

        {/* Tombol */}
        <div className="flex flex-col gap-3 mt-6">
          <button
            className="bg-sporta-blue text-white py-3 rounded-xl font-semibold"
            onClick={() => navigate("/register")}
          >
            Saya Setuju
          </button>
          <button
            className="text-sporta-blue text-sm hover:underline"
            onClick={() => navigate("/")}
          >
            Tidak Setuju
          </button>
        </div>
      </div>
    </div>
  );
}

export default PersonalData;
