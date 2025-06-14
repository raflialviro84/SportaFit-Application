// src/pages/KebijakanPrivasi.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";

export default function KebijakanPrivasi() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex justify-center px-4 py-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center h-14 px-4 bg-white border-b">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <IoArrowBack size={22} />
          </button>
          <h1 className="flex-1 text-center text-lg font-jakarta font-bold">
            Kebijakan Privasi
          </h1>
          <div className="w-6" />
        </div>

        {/* Judul Konten */}
        <div className="px-6 pt-4 mb-3">
          <h2 className="text-[18px] sm:text-[20px] font-bold text-sporta-blue leading-snug">
            KEBIJAKAN PRIVASI &amp; SYARAT PENGGUNAAN SPORTA FIT
          </h2>
        </div>

        {/* Konten Scrollable + Tombol */}
        <div className="px-6 pb-6">
          {/* Box Dashed */}
          <div className="border-2 border-dashed border-purple-400 rounded-xl p-4 h-[589px] overflow-y-auto space-y-4 text-sm text-gray-700 font-jakarta leading-relaxed">
            <div>
              <h3 className="text-sporta-blue font-bold mb-1">1. Definisi</h3>
              <ul className="list-disc ml-4 space-y-1">
                <li>
                  <strong>Sporta Fit</strong>: Aplikasi untuk pemantauan
                  kebugaran, pencatatan aktivitas olahraga, dan gaya hidup sehat.
                </li>
                <li>
                  <strong>Pengguna</strong>: Individu yang melakukan registrasi
                  aplikasi.
                </li>
                <li>
                  <strong>Data Pribadi</strong>: Nama, email, no. telepon,
                  biometrik, dan data lain.
                </li>
                <li>
                  <strong>Keanggotaan</strong>: Status pengguna (gratis/premium).
                </li>
                <li>
                  <strong>Transaksi</strong>: Aktivitas pembayaran dan fitur
                  tambahan lainnya.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sporta-blue font-bold mb-1">2. Ketentuan Umum</h3>
              <ul className="list-disc ml-4 space-y-1">
                <li>Kebijakan berlaku untuk semua pengguna.</li>
                <li>Pendaftaran dianggap menyetujui isi kebijakan ini.</li>
                <li>
                  Sporta Fit dapat mengubah kebijakan sewaktu‑waktu dengan
                  pemberitahuan.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sporta-blue font-bold mb-1">
                3. Persyaratan Keanggotaan
              </h3>
              <ul className="list-disc ml-4 space-y-1">
                <li>Minimal usia 17 tahun dengan izin orang tua.</li>
                <li>Data pendaftaran harus akurat dan terkini.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sporta-blue font-bold mb-1">4. Registrasi Sporta Fit</h3>
              <p>
                Untuk mendaftar, pengguna harus mengisi data pribadi atau login
                melalui Google, Apple, atau Facebook. Pengguna wajib memberi
                izin kepada Sporta Fit untuk mengelola data pribadi.
              </p>
            </div>

            <div>
              <h3 className="text-sporta-blue font-bold mb-1">5. Aktivasi Status</h3>
              <p>
                Setelah mendaftar, pengguna akan menerima email verifikasi. Jika
                tidak diaktivasi dalam 48 jam, akun bisa ditangguhkan.
              </p>
            </div>

            <div>
              <h3 className="text-sporta-blue font-bold mb-1">6. Pengamanan Transaksi</h3>
              <p>
                Sporta Fit menggunakan enkripsi untuk melindungi transaksi. Semua
                transaksi bersifat final, kecuali terbukti ada kesalahan sistem.
              </p>
            </div>

            <div>
              <h3 className="text-sporta-blue font-bold mb-1">7. Penggunaan Aplikasi</h3>
              <ul className="list-disc ml-4 space-y-1">
                <li>Diperbolehkan hanya untuk keperluan pribadi.</li>
                <li>Dilarang untuk penyalahgunaan atau tindakan ilegal.</li>
                <li>Pelanggaran dapat menyebabkan pemblokiran akun.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sporta-blue font-bold mb-1">8. Pelayanan dan Pengaduan</h3>
              <p>
                Pengaduan dapat dilakukan melalui email dan akan diproses
                maksimal 5 hari kerja.
              </p>
            </div>

            <div>
              <h3 className="text-sporta-blue font-bold mb-1">
                9. Ketentuan Penggunaan Aplikasi
              </h3>
              <p>
                Pengguna wajib menjaga kerahasiaan akun. Sporta Fit dapat
                memperbarui fitur tanpa pemberitahuan sebelumnya.
              </p>
            </div>

            <div>
              <h3 className="text-sporta-blue font-bold mb-1">10. Potensi Risiko</h3>
              <p>
                Sporta Fit tidak bertanggung jawab atas cedera yang terjadi
                akibat penggunaan aplikasi. Konsultasi dengan dokter disarankan.
              </p>
            </div>

            <div>
              <h3 className="text-sporta-blue font-bold mb-1">11. Lain‑lain</h3>
              <p>
                Segala sengketa diselesaikan secara musyawarah. Kebijakan ini
                tunduk pada hukum yang berlaku di wilayah operasional.
              </p>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="flex flex-col gap-3 mt-6">
            <button
              className="bg-sporta-blue text-white py-3 rounded-xl font-semibold"
              onClick={() => navigate("/")}
            >
              Saya Setuju
            </button>
            <button
              className="text-sporta-blue text-sm hover:underline"
              onClick={() => navigate(-1)}
            >
              Tidak Setuju
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
