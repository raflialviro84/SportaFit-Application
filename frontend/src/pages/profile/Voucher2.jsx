import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  IoArrowBack,
  IoDocumentTextOutline,
  IoHelpCircleOutline,
  IoInformationCircleOutline,
  IoChevronForward,
  IoTicketOutline,
} from "react-icons/io5";
import { useVoucher } from "../../context/voucher-context.js";
import { useAuth } from "../../context/AuthContext";

export default function VoucherDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getVoucherById, userVouchers, useVoucher: redeemVoucher, addVoucherToUser } = useVoucher();
  const { user } = useAuth();
  const [voucherData, setVoucherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState(null);
  const [redeemSuccess, setRedeemSuccess] = useState(null);

  // Cek apakah user sudah memiliki voucher ini
  const userHasVoucher = userVouchers.some(v => v.id === parseInt(id));

  // Cek apakah voucher sudah digunakan
  const voucherIsUsed = userVouchers.find(v => v.id === parseInt(id))?.isUsed || false;

  // Ambil detail voucher saat komponen dimuat
  useEffect(() => {
    const fetchVoucherDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        // Ambil detail voucher dari context
        const voucherDetail = await getVoucherById(id);

        // Siapkan data untuk tampilan
        const formattedVoucher = {
          ...voucherDetail,
          category: "Badminton",
          expiryLabel: "Berlaku Hingga",
          expiryDate: voucherDetail.validUntil,
          sections: [
            {
              icon: <IoDocumentTextOutline size={20} className="text-sporta-blue" />,
              title: "Syarat dan Ketentuan",
              content: [
                `Voucher hanya berlaku untuk pemesanan lapangan badminton.`,
                `Minimal pembelian Rp ${voucherDetail.minPurchase.toLocaleString('id-ID')}.`,
                `Voucher dapat digunakan hingga tanggal yang tertera pada voucher ini, atau selama voucher masih tersedia.`,
              ],
              hasChevron: true,
            },
            {
              icon: <IoHelpCircleOutline size={20} className="text-sporta-blue" />,
              title: "Bagaimana Cara Memakai Voucher ini?",
              content: [
                "Pastikan aplikasi Sporta Fit Anda sudah diperbarui ke versi terbaru.",
                "Pilih voucher ini saat melakukan pembayaran.",
              ],
              hasChevron: true,
            },
            {
              icon: <IoInformationCircleOutline size={20} className="text-sporta-orange" />,
              title: "Tentang Voucher ini",
              content: [
                voucherDetail.discountType === "percentage"
                  ? `Diskon ${voucherDetail.discountValue}% hingga maksimal Rp ${voucherDetail.maxDiscount ? voucherDetail.maxDiscount.toLocaleString('id-ID') : 'tidak terbatas'}`
                  : `Diskon tetap sebesar Rp ${voucherDetail.discountValue.toLocaleString('id-ID')}`
              ],
              hasChevron: true,
            },
          ],
        };

        setVoucherData(formattedVoucher);
      } catch (err) {
        console.error("Error fetching voucher detail:", err);
        setError(err.message || "Gagal mengambil detail voucher");
      } finally {
        setLoading(false);
      }
    };

    fetchVoucherDetail();
  }, [id, getVoucherById]);

  // Fungsi untuk menggunakan voucher
  const handleUseVoucher = async () => {
    try {
      setRedeeming(true);
      setRedeemError(null);
      setRedeemSuccess(null);

      // Panggil fungsi useVoucher dari context
      const result = await redeemVoucher(id);

      setRedeemSuccess(result.message || "Voucher berhasil digunakan");

      // Redirect ke halaman arena setelah 1 detik
      setTimeout(() => {
        navigate("/arena");
      }, 1000);
    } catch (err) {
      console.error("Error using voucher:", err);
      setRedeemError(err.message || "Gagal menggunakan voucher");
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#F9FAFB] flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-[434px] bg-white rounded-3xl overflow-hidden shadow-md">
        {/* Header */}
        <div className="flex items-center px-4 h-14 border-b bg-white">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <IoArrowBack size={22} />
          </button>
          <h1 className="flex-1 text-center font-jakarta font-bold text-lg">
            Voucher
          </h1>
          <div className="w-6" />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sporta-blue"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6">
            <div className="p-4 bg-red-50 text-red-700 rounded-lg">
              <p className="text-sm">{error}</p>
              <button
                onClick={() => navigate(-1)}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Kembali
              </button>
            </div>
          </div>
        )}

        {/* Voucher Content */}
        {!loading && !error && voucherData && (
          <>
            {/* Hero Image */}
            <div className="relative">
              <img
                src={voucherData.imageUrl}
                alt={voucherData.title}
                className="w-full h-[160px] object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/400x160/1e40af/ffffff?text=Voucher";
                }}
              />
              {/* dekorasi bulatan biru */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-5 bg-sporta-blue rounded-b-full" />
            </div>

            {/* Judul & Kategori */}
            <div className="px-6 pt-4">
              <h2 className="font-jakarta font-semibold text-base">
                {voucherData.title}
              </h2>
              <p className="mt-1 text-sm text-gray-600">{voucherData.category}</p>
            </div>

            {/* Expiry */}
            <div className="px-6 mt-4 flex items-center justify-between">
              <span className="text-xs text-gray-500">{voucherData.expiryLabel}</span>
              <span className="text-xs font-medium">{voucherData.expiryDate}</span>
            </div>

            {/* Redeem Error/Success Messages */}
            {redeemError && (
              <div className="px-6 mt-4">
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {redeemError}
                </div>
              </div>
            )}

            {redeemSuccess && (
              <div className="px-6 mt-4">
                <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                  {redeemSuccess}
                </div>
              </div>
            )}

            {/* Section List */}
            <div className="mt-4 divide-y">
              {voucherData.sections.map((sec, i) => (
                <div
                  key={i}
                  className="px-6 py-4 flex items-start justify-between hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    if (sec.title === "Syarat dan Ketentuan") {
                      navigate("/voucher-sk");
                    } else if (sec.title === "Bagaimana Cara Memakai Voucher ini?") {
                      navigate("/voucher-cp");
                    } else if (sec.title === "Tentang Voucher ini") {
                      navigate("/voucher-info");
                    }
                  }}
                >
                  <div className="flex items-start">
                    <div className="mt-1">{sec.icon}</div>
                    <div className="ml-3">
                      <p className="font-jakarta font-medium text-sm">
                        {sec.title}
                      </p>
                      {sec.content.map((line, idx) => (
                        <p
                          key={idx}
                          className="mt-1 text-xs text-gray-600 leading-tight"
                        >
                          {idx + 1}. {line}
                        </p>
                      ))}
                    </div>
                  </div>
                  {sec.hasChevron && (
                    <IoChevronForward
                      size={20}
                      className="text-gray-400 mt-1"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Tombol Pakai Sekarang */}
            <div className="px-6 pb-6 pt-4">
              {userHasVoucher && voucherIsUsed ? (
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-600 py-3 rounded-lg font-semibold cursor-not-allowed"
                >
                  Voucher Sudah Digunakan
                </button>
              ) : userHasVoucher ? (
                <button
                  onClick={handleUseVoucher}
                  disabled={redeeming}
                  className={`w-full bg-sporta-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors ${
                    redeeming ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {redeeming ? "Memproses..." : "Pakai Sekarang"}
                </button>
              ) : (
                <button
                  onClick={async () => {
                    try {
                      setRedeeming(true);
                      setRedeemError(null);
                      setRedeemSuccess(null);

                      // Tambahkan voucher ke user
                      const result = await addVoucherToUser(voucherData.code);

                      setRedeemSuccess(result.message || "Voucher berhasil ditambahkan");

                      // Refresh halaman setelah 1 detik
                      setTimeout(() => {
                        window.location.reload();
                      }, 1000);
                    } catch (err) {
                      console.error("Error adding voucher:", err);
                      setRedeemError(err.message || "Gagal menambahkan voucher");
                    } finally {
                      setRedeeming(false);
                    }
                  }}
                  disabled={redeeming}
                  className={`w-full bg-sporta-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors ${
                    redeeming ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {redeeming ? "Memproses..." : "Tambahkan ke Voucher Saya"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
