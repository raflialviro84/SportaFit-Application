// src/pages/main_menu/Home.jsx
import { useLocation } from "../../context/LocationContext"; // ✅
import HeaderSearch from "./HeaderSearch";
import PromoBanner from "./PromoBanner";
import CategoryList from "./CategoryList";
import PromoHighlight from "./PromoHighlight";
import BottomNavbar from "./BottomNavbar";

export default function Home() {
  const { location } = useLocation(); // ini ambil lokasi global

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-[#F9FAFB]">
      <div className="w-full max-w-[434px] pb-24">
        <HeaderSearch />
        <PromoBanner />
        <CategoryList />
        <PromoHighlight />
      </div>

      <BottomNavbar />
    </div>
  );
}
