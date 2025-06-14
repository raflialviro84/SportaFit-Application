import { FiSearch } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { IoChevronDownSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useLocation } from "../../context/LocationContext"; // ⬅️ Tambahkan ini
import { useState } from "react";

function HeaderSearch() {
  const navigate = useNavigate();
  const { location } = useLocation(); // ⬅️ Ambil lokasi dari context
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/arena?search=${encodeURIComponent(searchQuery)}&city=${encodeURIComponent(location)}`);
    }
  };

  return (
    <div className="w-full max-w-[434px] bg-white font-jakarta overflow-hidden">
      {/* Search Bar dan Icon User */}
      <div className="px-4 py-5">
        <div className="flex items-center justify-between gap-4 ">
          <form onSubmit={handleSearch} className="flex items-center flex-1">
            <div className="flex items-center flex-1 bg-gray-100 rounded-full px-4 py-2">
              <FiSearch
                className="text-gray-500 mr-2 cursor-pointer"
                size={18}
                onClick={handleSearch}
              />
              <input
                type="text"
                placeholder="Cari Lapangan di Sporta Fit!"
                className="bg-transparent outline-none text-sm w-full placeholder:text-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
          <FaUserCircle
            className="text-gray-800 cursor-pointer"
            size={26}
            onClick={() => navigate("/profil1")}
          />
        </div>
      </div>

      {/* Lokasi dengan Background Abu dan Rounded Atas */}
      <div
        className="w-full bg-gray-100 px-4 py-3 rounded-t-3xl cursor-pointer"
        onClick={() => navigate("/lokasi")}
      >
        <div className="flex items-center justify-between text-sm text-gray-700 font-medium">
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>
            {/* GANTI DENGAN CONTEXT */}
            <span>{location}</span>
          </div>
          <IoChevronDownSharp size={16} className="text-gray-500" />
        </div>
      </div>
    </div>
  );
}

export default HeaderSearch;
