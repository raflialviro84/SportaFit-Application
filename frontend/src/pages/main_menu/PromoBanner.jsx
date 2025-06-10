import { useEffect, useState } from "react";

const bannerImages = [
  "/banner1.png",
  "/banner2.png",
  "/banner3.png",
];

function PromoBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % bannerImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-[434px] h-[140px] sm:h-[250px] md:h-[300px] overflow-hidden font-jakarta">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${current * 100}%)`,
        }}
      >
        {bannerImages.map((src, i) => (
          <div key={i} className="w-full flex-shrink-0 h-full">
            <img
              src={src}
              alt={`Banner ${i + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default PromoBanner;
