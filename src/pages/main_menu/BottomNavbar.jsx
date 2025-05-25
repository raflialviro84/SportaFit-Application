// src/pages/main_menu/BottomNavbar.jsx

import { FaHome, FaClipboardList, FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function BottomNavbar() {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-1px_rgba(0,0,0,0.06)] z-10">
      <div className="flex justify-around py-2 px-4">
        {/* Home button */}
        <button
          onClick={() => navigate("/home")}
          className="flex flex-col items-center text-gray-600 w-full py-2"
        >
          <FaHome size={22} />
          <span className="text-xs">Beranda</span>
        </button>

        {/* Orders button */}
        <button
          onClick={() => navigate("/pemesanan")}
          className="flex flex-col items-center text-gray-600 w-full py-2"
        >
          <FaClipboardList size={22} />
          <span className="text-xs">Pemesanan</span>
        </button>

        {/* Transactions button */}
        <button
          onClick={() => {
            console.log('Navigating to transactions page');
            navigate("/transaksi");
          }}
          className="flex flex-col items-center text-gray-600 w-full py-2"
        >
          <FaShoppingCart size={22} />
          <span className="text-xs">Transaksi</span>
        </button>
      </div>
    </div>
  );
}

export default BottomNavbar;