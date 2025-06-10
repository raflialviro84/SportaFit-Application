import { useNavigate } from "react-router-dom";
import { useLocation } from "../../context/LocationContext";
import HeaderSearch from "./HeaderSearch";
import PromoBanner from "./PromoBanner";
import CategoryList from "./CategoryList";
import PromoHighlight from "./PromoHighlight";
import BottomNavbar from "./BottomNavbar";

export default function HomeGuest() {
  const navigate = useNavigate();
  const { location } = useLocation();

  // Handler untuk fitur yang butuh login
  const requireLogin = (e) => {
    e.preventDefault();
    navigate("/login");
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-[#F9FAFB]">
      <div className="w-full max-w-[434px] pb-24">
        {/* Header Search tetap bisa dipakai */}
        <HeaderSearch />
        {/* Promo banner tetap bisa dilihat */}
        <PromoBanner />
        {/* CategoryList: hanya arena & detail arena yang bisa, fitur lain redirect login */}
        <CategoryList onRequireLogin={requireLogin} isGuest={true} />
        {/* Promo highlight tetap bisa dilihat */}
        <PromoHighlight />
      </div>
      {/* BottomNavbar: semua menu kecuali arena diarahkan ke login */}
      <BottomNavbar onRequireLogin={requireLogin} isGuest={true} />
    </div>
  );
}
