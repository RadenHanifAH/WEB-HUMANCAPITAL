import React, { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  Award,
  Building2,
  Target,
  Flag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Syaamil1 from "../assets/perusahaan.png";
import Syaamil2 from "../assets/perusahaan2.png";
import Syaamil3 from "../assets/perusahaan1.png";

function About() {
  const images = [Syaamil1, Syaamil2, Syaamil3];
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);

  const nextSlide = () => {
    setFade(false);
    setTimeout(() => {
      setCurrent((prev) => (prev + 1) % images.length);
      setFade(true);
    }, 300);
  };

  const prevSlide = () => {
    setFade(false);
    setTimeout(() => {
      setCurrent((prev) => (prev - 1 + images.length) % images.length);
      setFade(true);
    }, 300);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  },);

  return (
    <section className="bg-sky-700 text-white py-16 lg:py-20 relative overflow-hidden w-full">
      {/* pola background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
      </div>

      <div className="w-full flex flex-col lg:flex-row items-center gap-12 relative">
        {/* Bagian teks */}
        <div className="flex-1 space-y-6 px-6 lg:px-12">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white/90 text-sm font-medium">
            <Building2 className="h-4 w-4" />
            Tentang Perusahaan
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            Perusahaan <span className="text-secondary">Syaamil Group</span>
          </h2>

          <p className="text-base sm:text-md leading-relaxed text-justify">
            Syaamil Group merupakan perusahaan yang bergerak dalam berbagai
            bidang, menghadirkan inovasi dan peluang kerja bagi talenta muda
            untuk berkembang bersama membangun masa depan.
          </p>
          <p className="text-base sm:text-md leading-relaxed text-justify">
            Kami percaya bahwa sumber daya manusia adalah aset utama, sehingga
            kami senantiasa berkomitmen untuk menciptakan lingkungan kerja yang
            nyaman, kolaboratif, dan penuh semangat.
          </p>

          {/* Visi & Misi */}
          <div className="space-y-6 pt-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-secondary" />
                <h3 className="text-md font-semibold">Visi</h3>
              </div>
              <p className="text-white/80 leading-relaxed text-justify sm:text-md">
                Menjadi Perusahaan yang terdepan dalam Membumikan Al Qur’an &
                Menghidupkan Sirah.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Flag className="h-5 w-5 text-secondary" />
                <h3 className="text-md font-semibold">Misi</h3>
              </div>
              <p className="text-white/80 leading-relaxed text-justify sm:text-md">
                Mewujudkan perusahaan yang penuh keberkahan, siap menghadapi
                tantangan global, dan berkomitmen untuk menyebarkan nilai-nilai
                Islam secara mudah dan menyenangkan.
              </p>
            </div>
          </div>

          {/* highlights */}
          <div className="grid grid-cols-2 gap-6 pt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <Users className="h-8 w-8 text-secondary mx-auto mb-2" />
              <div className="font-semibold">Tim Profesional</div>
              <div className="text-white/70 text-sm">Berpengalaman</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <BookOpen className="h-8 w-8 text-secondary mx-auto mb-2" />
              <div className="font-semibold">Pendidikan Islam</div>
              <div className="text-white/70 text-sm">Berkualitas Tinggi</div>
            </div>
          </div>
        </div>

        {/* Bagian gambar slider */}
        <div className="flex-1 relative px-6 lg:px-12 w-full">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={images[current]}
              alt="Tentang Syaamil Group"
              className={`w-full h-64 sm:h-80 md:h-[450px] lg:h-[550px] object-cover transition-opacity duration-500 ${
                fade ? "opacity-100" : "opacity-0"
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

            {/* tombol navigasi */}
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-black rounded-full p-2"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-black rounded-full p-2"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Floating card */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 lg:left-[-1.5rem] lg:translate-x-0 bg-white rounded-xl p-6 shadow-xl max-w-[90%] lg:max-w-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-sky-700/10 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-sky-700" />
              </div>
              <div>
                <div className="font-semibold text-gray-800">
                  Penerbit Terpercaya
                </div>
                <div className="text-sm text-gray-500">Sejak 1997</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
