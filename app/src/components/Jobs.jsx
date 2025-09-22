import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, MapPin, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const jobs = [
  {
    id: 1,
    title: "Product Manager - Makanan Instan",
    department: "Product Development",
    location: "Jakarta",
    type: "Full-time",
    experience: "3-5 tahun",
    description:
      "Memimpin pengembangan produk makanan instan inovatif untuk pasar Indonesia dan regional...",
    requirements: ["S1 Teknologi Pangan/Marketing", "Pengalaman product management", "Kemampuan analisis pasar"],
  },
  {
    id: 2,
    title: "Quality Assurance Specialist",
    department: "Quality Control",
    location: "Surabaya",
    type: "Full-time",
    experience: "2-4 tahun",
    description:
      "Memastikan kualitas produk sesuai standar internasional dan regulasi pemerintah...",
    requirements: ["S1 Teknologi Pangan/Kimia", "Sertifikasi HACCP/ISO", "Detail oriented"],
  },
  {
    id: 3,
    title: "Digital Marketing Manager",
    department: "Marketing",
    location: "Jakarta",
    type: "Full-time",
    experience: "4-6 tahun",
    description:
      "Mengembangkan strategi pemasaran digital untuk meningkatkan brand awareness...",
    requirements: ["S1 Marketing/Komunikasi", "Pengalaman digital marketing", "Data-driven mindset"],
  },
];

const JobSlider = () => {
  const [visibleItems, setVisibleItems] = useState(1); // default 1 card
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const cardRef = useRef(null);
  const [cardWidth, setCardWidth] = useState(320);

  useEffect(() => {
    const updateLayout = () => {
      if (cardRef.current) {
        setCardWidth(cardRef.current.offsetWidth + 16);
      }
      if (window.innerWidth >= 1024) {
        setVisibleItems(3); // desktop: 3 card
      } else if (window.innerWidth >= 640) {
        setVisibleItems(2); // tablet: 2 card
      } else {
        setVisibleItems(1); // mobile: 1 card
      }
    };
    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  const clonedJobs = [
    ...jobs.slice(-visibleItems),
    ...jobs,
    ...jobs.slice(0, visibleItems),
  ];

  const nextSlide = () => setCurrentIndex((prev) => prev + 1);
  const prevSlide = () => setCurrentIndex((prev) => prev - 1);

  useEffect(() => {
    if (currentIndex >= clonedJobs.length - visibleItems) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(visibleItems); // kembali ke awal
      }, 700);
    }
    if (currentIndex < 0) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(clonedJobs.length - (2 * visibleItems)); // ke akhir
      }, 700);
    }
  }, [currentIndex, clonedJobs.length, visibleItems]);

  useEffect(() => {
    if (!isTransitioning) {
      requestAnimationFrame(() => setIsTransitioning(true));
    }
  }, [isTransitioning]);

  return (
    <div className="py-10 px-4 text-center overflow-hidden bg-gray-50">
      <h1 className="text-gray-800 font-bold text-2xl sm:text-3xl mb-8">
        Lowongan <span className="text-[#FF7A30]">Pekerjaan</span>
      </h1>

      <div className="flex items-center justify-center gap-3 sm:gap-6">
        <button
          onClick={prevSlide}
          className="p-2 rounded-full bg-white shadow hover:bg-gray-100"
        >
          <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 text-sky-600" />
        </button>

        <div className="overflow-hidden w-full max-w-[1100px]">
          <div
            className={`flex gap-4 sm:gap-6 ${
              isTransitioning ? "transition-transform duration-700 ease-in-out" : ""
            }`}
            style={{
              transform: `translateX(-${currentIndex * cardWidth}px)`,
            }}
          >
            {clonedJobs.map((job, idx) => (
              <div
                ref={idx === 0 ? cardRef : null}
                key={`${job.id}-${idx}`}
                className="rounded-xl p-4 sm:p-6 w-[85%] sm:w-[300px] md:w-[340px] lg:w-[360px] min-h-[420px] flex-shrink-0 flex flex-col justify-between bg-white border hover:shadow-lg transition-shadow mx-auto"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-[#FF7A30] text-gray-700 text-[10px] sm:text-xs px-2 py-1 rounded-full">
                    {job.department}
                  </span>
                  <span className="border text-gray-600 text-[10px] sm:text-xs px-2 py-1 rounded-full">
                    {job.type}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-left">{job.title}</h2>
                <p className="text-sm text-gray-500 text-left line-clamp-3">{job.description}</p>
                <div className="space-y-2 text-left mt-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    {job.experience}
                  </div>
                </div>
                <div className="space-y-2 text-left mt-2">
                  <div className="text-sm font-medium">Persyaratan:</div>
                  <ul className="text-sm text-gray-500 space-y-1">
                    {job.requirements.map((req, index) => (
                      <li key={`${job.id}-req-${index}`} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
                <button className="mt-4 w-full bg-sky-600 text-white py-2 px-4 rounded-lg hover:bg-sky-500 transition">
                  Lamar Sekarang
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={nextSlide}
          className="p-2 rounded-full bg-white shadow hover:bg-gray-100"
        >
          <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 text-sky-600" />
        </button>
      </div>

      <div className="mt-6">
        <Link
          to="/lowongan"
          className="border border-sky-700 text-sky-600 px-6 py-2 rounded-lg hover:bg-sky-600 hover:text-white transition inline-block text-sm sm:text-base"
        >
          Lihat Semua Lowongan
        </Link>
      </div>
    </div>
  );
};

export default JobSlider;
