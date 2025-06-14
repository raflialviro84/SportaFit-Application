import promo1 from "/promo-70an.png";
import promo2 from "/promo-2.png";
import promo3 from "/promo-3.png";

const promoData = [
  {
    img: promo1,
    title: "Diskon 70% Booking Lapangan Badminton",
    desc: "Main badminton makin hemat! Booking sekarang dan nikmati diskon spesialnya.",
  },
  {
    img: promo2,
    title: "Jadi Member, Dapat Diskon 70%!",
    desc: "Gabung sekarang di Sporta Fit, dapatkan potongan besar buat kamu yang aktif!",
  },
  {
    img: promo3,
    title: "Sewa 1 Jam, Gratis 1 Jam!",
    desc: "Pakai waktu olahragamu dua kali lebih seru, booking sekarang dan manfaatkan promonya!",
  },
];

function PromoHighlight() {
  return (
    <div className="flex flex-col gap-4 px-4 mt-6 mb-28 font-jakarta">
      {promoData.map((item, idx) => (
        <div key={idx} className="bg-white shadow rounded-2xl overflow-hidden">
          {/* wrapper background-image agar otomatis merata */}
          <div
            className="w-full h-[230px] bg-center bg-cover"
            style={{ backgroundImage: `url(${item.img})` }}
          />

          {/* Konten teks dengan padding yang lebih rapat */}
          <div className="px-4 pt-2 pb-3">
            <h3 className="text-sm font-bold">{item.title}</h3>
            <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PromoHighlight;
