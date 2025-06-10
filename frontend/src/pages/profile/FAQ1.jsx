// src/pages/Faq.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";

export default function Faq() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center px-4 py-6">
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
            FAQ
          </h1>
          <div className="w-6" />
        </div>

        {/* Logo */}
        <div className="flex justify-center py-4">
          <img
            src="/Logo2.png"
            alt="Sporta Fit"
            className="h-12"
          />
        </div>

        {/* Title */}
        <div className="px-6">
          <h2 className="text-base sm:text-lg font-bold text-sporta-blue">
            FREQUENTLY ASKED QUESTION (PEMAIN)
          </h2>
        </div>

        {/* FAQ List */}
        <div className="px-6 pb-6">
          <div className="border-2 border-dashed border-purple-400 rounded-xl p-4 h-[589px] overflow-y-auto space-y-6 text-sm text-gray-700 font-jakarta leading-relaxed">
            {/* 1 */}
            <div>
              <h3 className="font-bold">1. Apa itu Sporta Fit?</h3>
              <p>
                Sporta Fit adalah platform yang memudahkan pemain untuk
                mencari lapangan olahraga dengan berbagai macam pilihan arena
                yang tersedia dan ditampilkan secara online.
              </p>
            </div>

            {/* 2 */}
            <div>
              <h3 className="font-bold">
                2. Kenapa saya harus bermain memakai Sporta Fit?
              </h3>
              <p>
                Dengan bermain melalui Sporta Fit, kamu dapat menyewa waktu dan
                lokasi tertentu dengan harga sewa real‑time secara akurat untuk
                memainkan lapangan. Selain itu, kami telah menjalin kerja sama
                secara langsung dengan mitra‑mitra penyedia arena yang tersedia
                di aplikasi. Sporta Fit memudahkan kamu untuk melihat, memesan,
                dan melakukan pembayaran dengan berbagai metode secara cepat
                dan transparan.
              </p>
            </div>

            {/* 3 */}
            <div>
              <h3 className="font-bold">
                3. Bagaimana cara saya melihat arena yang ada di sekitar saya?
              </h3>
              <p>
                Pada halaman utama, pilih kolom lokasi sesuai dengan domisili
                tempat tinggal kamu. Setelah itu, kamu bisa memilih jenis arena
                berdasarkan fitur filter. Sistem kami juga akan
                merekomendasikan beberapa arena terdekat yang bisa kamu pilih
                sesuai preferensi.
              </p>
            </div>

            {/* 4 */}
            <div>
              <h3 className="font-bold">
                4. Bagaimana jika saya ingin memesan lapangan secara langsung?
              </h3>
              <p>
                Sporta Fit memberikan pilihan kepada pemain untuk langsung
                menghubungi pihak penyedia lapangan yang terdaftar di aplikasi,
                namun kami tetap merekomendasikan pemesanan dilakukan melalui
                sistem demi keamanan dan transparansi.
              </p>
            </div>

            {/* 5 */}
            <div>
              <h3 className="font-bold">
                5. Bagaimana mengambil aktivitas di dalam aplikasi dan apa saja
                fiturnya?
              </h3>
              <p>
                Kamu dapat memilih jenis aktivitas (olahraga) yang ingin kamu
                mainkan. Mulai dari badminton, futsal, tenis meja, billiard, dan
                banyak lagi. Setelah itu, kamu bisa langsung memilih waktu,
                arena, serta layanan tambahan jika tersedia (seperti penyewaan
                alat).
              </p>
            </div>

            {/* 6 */}
            <div>
              <h3 className="font-bold">
                6. Di aplikasi mana saja Sporta Fit tersedia?
              </h3>
              <p>
                Sporta Fit tersedia dalam versi Android dan iOS. Kamu dapat
                mengunduh aplikasinya secara gratis melalui Google Play Store
                dan App Store.
              </p>
            </div>

            {/* 7 */}
            <div>
              <h3 className="font-bold">
                7. Kenapa jam yang berwarna merah pada halaman jadwal dapat
                kembali menjadi abu‑abu kembali?
              </h3>
              <p>
                Mungkin ada pemain yang sudah memesan tapi belum melakukan
                pembayaran sesuai batas waktu yang telah diberikan. Sehingga,
                jam tersebut dapat kembali di‑open dan dapat kamu pesan.
              </p>
            </div>

            {/* 8 */}
            <div>
              <h3 className="font-bold">
                8. Siapa saja bisa melakukan transaksi di Sporta Fit?
              </h3>
              <p>
                Ya, semua bisa. Namun, kamu harus melakukan login/daftar
                terlebih dahulu melalui aplikasi Sporta Fit.
              </p>
            </div>

            {/* 9 */}
            <div>
              <h3 className="font-bold">9. Pembayaran bisa lewat dengan cara apa?</h3>
              <p>
                Kamu bisa melakukan pembayaran melalui e‑wallet (OVO, DANA,
                LinkAja, ShopeePay) atau Virtual Account (Mandiri, BNI, BCA,
                BRI, dll).
              </p>
            </div>

            {/* 10 */}
            <div>
              <h3 className="font-bold">10. Apakah ada Surcharge di Sporta Fit?</h3>
              <p>
                Ya, Sporta Fit memberlakukan biaya layanan untuk pemeliharaan
                sistem dan komunikasi yang disalurkan ke partner.
              </p>
            </div>

            {/* 11 */}
            <div>
              <h3 className="font-bold">
                11. Apakah saya bisa memesan lapangan dengan menerima
                notifikasi setelah berhasil?
              </h3>
              <p>
                Ya, setelah pemesanan dan pembayaran selesai di sistem kami,
                kamu akan mendapatkan notifikasi serta email bahwa
                pesananmu sudah terkonfirmasi.
              </p>
            </div>

            {/* 12 */}
            <div>
              <h3 className="font-bold">
                12. Bagaimana cara saya bisa melihat pesanan saya?
              </h3>
              <p>
                Kamu bisa langsung melihat di akun kamu pada saat login di
                aplikasi, lalu pilih Riwayat Pesanan. Semua pesananmu akan
                terekam di dalam akun.
              </p>
            </div>

            {/* 13 */}
            <div>
              <h3 className="font-bold">
                13. Bagaimana saya dapat melihat status transaksi saya?
              </h3>
              <p>
                Kamu dapat melihat status transaksi tersebut di bagian Riwayat
                pada halaman Riwayat.
              </p>
            </div>

            {/* 14 */}
            <div>
              <h3 className="font-bold">14. Apa bedanya status transaksi di dalam pesanan?</h3>
              <ul className="list-disc ml-4 space-y-1">
                <li>Menunggu pembayaran (kamu belum menyelesaikan pembayaran)</li>
                <li>Berhasil (pembayaran dan pesananmu telah sukses dikonfirmasi)</li>
                <li>Gagal (pembayaran atau proses lainnya tidak berhasil)</li>
              </ul>
            </div>

            {/* 15 */}
            <div>
              <h3 className="font-bold">15. Apakah saya dapat membatalkan pesanan?</h3>
              <p>
                Untuk saat ini, kebijakan kami untuk pesanan yang sudah
                berhasil tidak dapat dibatalkan.
              </p>
            </div>

            {/* 16 */}
            <div>
              <h3 className="font-bold">
                16. Bagaimana saya bisa memesan ulang pesanan yang pernah
                dilakukan sebelumnya?
              </h3>
              <p>
                Pada fitur Riwayat, kamu akan bisa melihat daftar pesanan
                sebelumnya dan langsung melakukan pemesanan ulang di waktu dan
                arena yang sama.
              </p>
            </div>

            {/* 17 */}
            <div>
              <h3 className="font-bold">17. Apa yang harus saya lakukan jika lapangan tidak tersedia?</h3>
              <p>
                Apabila kamu sudah mencari beberapa kali namun tempat yang
                kamu pilih tidak tersedia, kemungkinan sudah penuh. Coba ubah
                hari/tanggal ataupun jam untuk mencari slot yang tersedia
                lainnya.
              </p>
            </div>

            {/* 18 */}
            <div>
              <h3 className="font-bold">
                18. Bagaimana jika saya sudah bayar tapi lapangan tidak bisa
                digunakan?
              </h3>
              <p>
                Dalam situasi di mana pesanan tidak dapat terpakai karena
                kesalahan dari mitra penyedia, maka kami akan membantu
                menyelesaikan pengembalian dana sesuai kebijakan yang berlaku.
              </p>
            </div>

            {/* 19 */}
            <div>
              <h3 className="font-bold">
                19. Apakah saya bisa memesan 2 arena berbeda dalam satu
                transaksi?
              </h3>
              <p>
                Saat ini, kamu tidak bisa melakukan pemesanan pada dua arena
                berbeda dalam satu transaksi. Harus melakukan transaksi
                terpisah.
              </p>
            </div>

            {/* 20 */}
            <div>
              <h3 className="font-bold">
                20. Apakah saya bisa memesan aktivitas yang berbeda dalam satu
                transaksi?
              </h3>
              <p>
                Saat ini kamu juga tidak dapat melakukan pemesanan berbeda
                (misal satu pesanan badminton & satu pesanan futsal) dalam satu
                transaksi. Harus dibuat dalam transaksi yang terpisah.
              </p>
            </div>

            {/* 21 */}
            <div>
              <h3 className="font-bold">
                21. Apakah saya bisa datang ke lokasi tanpa melakukan
                pemesanan?
              </h3>
              <p>
                Ya, tergantung dari mitra lapangan di lokasi. Namun kami tetap
                menyarankan pemesanan dilakukan melalui aplikasi untuk menjamin
                ketersediaan slot.
              </p>
            </div>

            {/* 22 */}
            <div>
              <h3 className="font-bold">
                22. Apakah saya bisa memodifikasi pesanan saya setelah
                pembayaran?
              </h3>
              <p>
                Untuk saat ini, pesanan yang sudah dibayar tidak dapat diubah.
                Harap pastikan semua informasi sudah benar sebelum melakukan
                konfirmasi pembayaran.
              </p>
            </div>

            {/* 23 */}
            <div>
              <h3 className="font-bold">23. Apakah Sporta Fit tersedia di luar kota saya?</h3>
              <p>
                Sporta Fit tersedia di kota‑kota besar di Indonesia. Tinggal
                cari “lokasi terdekat” dan kamu bisa eksplor lapangan di sana.
              </p>
            </div>

            {/* 24 */}
            <div>
              <h3 className="font-bold">
                24. Bagaimana jika saya menemukan kendala dalam menggunakan
                aplikasi Sporta Fit?
              </h3>
              <p>
                Segera hubungi tim kami di email support@
 sportafit.id atau gunakan fitur Bantuan di aplikasi untuk mendapatkan respon secepatnya.
              </p>
            </div>

            {/* 25 */}
            <div>
              <h3 className="font-bold">
                25. Bagaimana jika saya ingin menambahkan arena saya sebagai
                mitra di Sporta Fit?
              </h3>
              <p>
                Kamu dapat masuk ke website kami di www.sportafit.id atau
                menghubungi kami via email di partner@sportafit.id.
              </p>
            </div>
          </div>

          {/* Button Kembali */}
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-sporta-blue text-white py-3 rounded-lg font-semibold mt-4"
          >
            Kembali
          </button>
        </div>
      </div>
    </div>
  );
}
