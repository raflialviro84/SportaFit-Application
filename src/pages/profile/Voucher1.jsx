import { useNavigate } from "react-router-dom";
import { IoArrowBack, IoTicketOutline } from "react-icons/io5";
import { useState } from "react";
import { useVoucher } from "../../context/voucher-context";

export default function VoucherPage() {
  const navigate = useNavigate();
  const { vouchers, userVouchers, loading, error, addVoucherToUser } = useVoucher();
  const [voucherCode, setVoucherCode] = useState("");
  const [addingVoucher, setAddingVoucher] = useState(false);
  const [addVoucherError, setAddVoucherError] = useState("");
  const [addVoucherSuccess, setAddVoucherSuccess] = useState("");

  // Fungsi untuk menambahkan voucher
  const handleAddVoucher = async (e) => {
    e.preventDefault();

    if (!voucherCode.trim()) {
      setAddVoucherError("Kode voucher tidak boleh kosong");
      return;
    }

    try {
      setAddingVoucher(true);
      setAddVoucherError("");
      setAddVoucherSuccess("");

      // Panggil fungsi addVoucherToUser dari VoucherContext
      const result = await addVoucherToUser(voucherCode);

      setAddVoucherSuccess(result.message || "Voucher berhasil ditambahkan");
      setVoucherCode("");
    } catch (err) {
      console.error("Error adding voucher:", err);
      setAddVoucherError(err.message || "Gagal menambahkan voucher");
    } finally {
      setAddingVoucher(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#F9FAFB] flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-[434px] bg-white rounded-3xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center px-4 py-4 border-b bg-white">
          <button onClick={() => navigate(-1)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <IoArrowBack size={22} />
          </button>
          <h2 className="flex-1 text-center text-lg font-bold">Voucher</h2>
          <div className="w-6" />
        </div>

        {/* Add Voucher Form */}
        <div className="px-4 py-4 bg-white border-b">
          <form onSubmit={handleAddVoucher} className="flex flex-col space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Tambah Voucher</h3>

            {/* Error Message */}
            {addVoucherError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {addVoucherError}
              </div>
            )}

            {/* Success Message */}
            {addVoucherSuccess && (
              <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                {addVoucherSuccess}
              </div>
            )}

            <div className="flex space-x-2">
              <input
                type="text"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                placeholder="Masukkan kode voucher"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sporta-blue"
              />
              <button
                type="submit"
                disabled={addingVoucher}
                className={`px-4 py-2 bg-sporta-blue text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors ${
                  addingVoucher ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {addingVoucher ? "Menambahkan..." : "Tambah"}
              </button>
            </div>
          </form>
        </div>

        {/* Category Tabs - only Badminton */}
        <div className="flex px-4 py-3 overflow-x-auto bg-white space-x-2 border-b">
          <button className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-800">
            Badminton
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-4 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sporta-blue"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4">
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          </div>
        )}

        {/* Voucher Cards */}
        <div className="p-4 space-y-4">
          {!loading && vouchers.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              <IoTicketOutline size={48} className="mx-auto mb-2 text-gray-400" />
              <p>Tidak ada voucher tersedia</p>
            </div>
          )}

          {vouchers.map((v) => {
            const userVoucher = userVouchers.find(uv => uv.voucherId === v.id || uv.id === v.id); // Check both voucherId and id
            const isClaimed = !!userVoucher;
            const isUsed = userVoucher?.isUsed;

            return (
              <div
                key={v.id}
                className={`bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow ${isUsed ? 'opacity-70' : ''}`}
              >
                <div className="h-40 w-full relative">
                  <img
                    src={v.imageUrl}
                    alt={v.title}
                    className={`w-full h-full object-cover ${isUsed ? 'grayscale' : ''}`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = v.id % 2 === 0
                        ? "https://via.placeholder.com/400x200/6366f1/ffffff?text=Cashback+25%"
                        : "https://via.placeholder.com/400x200/1e40af/ffffff?text=Voucher+Cashback";
                    }}
                  />
                  {isUsed && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg font-bold">
                        TERPAKAI
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-base font-semibold">{v.title}</h3>
                  <p className="text-xs text-gray-500 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Berlaku hingga {new Date(v.validUntil).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  {/* Status & Aksi */}
                  {isClaimed ? (
                    isUsed ? (
                      <button
                        className="mt-2 px-4 py-2 bg-gray-300 text-gray-600 rounded-full text-sm font-medium cursor-not-allowed"
                        disabled
                      >
                        Sudah Digunakan
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/voucher/${v.id}`)}
                        className="mt-2 px-4 py-2 bg-green-500 text-white rounded-full text-sm font-medium hover:bg-green-600 transition-colors"
                      >
                        Pakai
                      </button>
                    )
                  ) : (
                    <button
                      onClick={async () => {
                        setAddingVoucher(true);
                        setAddVoucherError("");
                        setAddVoucherSuccess("");
                        try {
                          const result = await addVoucherToUser(v.code);
                          setAddVoucherSuccess(result.message || "Voucher berhasil diklaim");
                        } catch (err) {
                          console.error("Error claiming voucher card:", err);
                          setAddVoucherError(err.response?.data?.message || err.message || "Gagal klaim voucher");
                        } finally {
                          setAddingVoucher(false);
                        }
                      }}
                      className="mt-2 px-4 py-2 bg-sporta-blue text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
                      disabled={addingVoucher}
                    >
                      {addingVoucher && voucherCode === v.code ? "Mengklaim..." : "Klaim Voucher"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
