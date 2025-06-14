import { useNavigate } from "react-router-dom";
import { IoArrowBack, IoTicketOutline } from "react-icons/io5";
import { useVoucher } from "../../context/voucher-context";
import { useAuth } from "../../context/auth-context";

export default function MyVoucherPage() {
  const navigate = useNavigate();
  const { userVouchers, loading, error } = useVoucher();
  const { user } = useAuth();

  // Filter voucher yang belum digunakan
  const activeVouchers = userVouchers.filter(v => !v.isUsed);
  
  // Filter voucher yang sudah digunakan
  const usedVouchers = userVouchers.filter(v => v.isUsed);

  return (
    <div className="min-h-[100dvh] bg-[#F9FAFB] flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-[434px] bg-white rounded-3xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center px-4 py-4 border-b bg-white">
          <button onClick={() => navigate(-1)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <IoArrowBack size={22} />
          </button>
          <h2 className="flex-1 text-center text-lg font-bold">Voucher Saya</h2>
          <div className="w-6" />
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

        {/* Empty State */}
        {!loading && !error && userVouchers.length === 0 && (
          <div className="p-8 text-center">
            <IoTicketOutline size={48} className="mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500 mb-4">Anda belum memiliki voucher</p>
            <button
              onClick={() => navigate("/voucher")}
              className="px-4 py-2 bg-sporta-blue text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Lihat Voucher
            </button>
          </div>
        )}

        {/* Active Vouchers */}
        {!loading && !error && activeVouchers.length > 0 && (
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Voucher Aktif</h3>
            <div className="space-y-4">
              {activeVouchers.map((v) => (
                <div
                  key={v.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="h-40 w-full">
                    <img
                      src={v.imageUrl}
                      alt={v.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = v.id % 2 === 0
                          ? "https://via.placeholder.com/400x200/6366f1/ffffff?text=Cashback+25%"
                          : "https://via.placeholder.com/400x200/1e40af/ffffff?text=Voucher+Cashback";
                      }}
                    />
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
                      Berlaku hingga {v.validUntil}
                    </p>
                    <button
                      onClick={() => navigate(`/voucher/${v.id}`)}
                      className="mt-2 px-4 py-2 bg-sporta-blue text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Pakai
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Used Vouchers */}
        {!loading && !error && usedVouchers.length > 0 && (
          <div className="p-4 border-t">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Voucher Terpakai</h3>
            <div className="space-y-4">
              {usedVouchers.map((v) => (
                <div
                  key={v.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-md opacity-70"
                >
                  <div className="h-40 w-full relative">
                    <img
                      src={v.imageUrl}
                      alt={v.title}
                      className="w-full h-full object-cover grayscale"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = v.id % 2 === 0
                          ? "https://via.placeholder.com/400x200/6366f1/ffffff?text=Cashback+25%"
                          : "https://via.placeholder.com/400x200/1e40af/ffffff?text=Voucher+Cashback";
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg font-bold">
                        TERPAKAI
                      </div>
                    </div>
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
                      Digunakan pada {new Date(v.usedAt).toLocaleDateString('id-ID')}
                    </p>
                    <button
                      onClick={() => navigate(`/voucher/${v.id}`)}
                      className="mt-2 px-4 py-2 bg-gray-300 text-gray-600 rounded-full text-sm font-medium cursor-not-allowed"
                    >
                      Sudah Digunakan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
