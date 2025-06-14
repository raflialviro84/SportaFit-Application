import { useAuth } from "../../context/AuthContext";
import BottomNavbar from "./BottomNavbar";
import HeaderSearch from "./HeaderSearch";
import PromoBanner from "./PromoBanner";
import CategoryList from "./CategoryList";
import PromoHighlight from "./PromoHighlight";

export default function HomeMember() {
  const { user } = useAuth();
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
