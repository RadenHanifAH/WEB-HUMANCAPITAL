import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  BookOpen,
  Building2,
  Target,
  Flag,
} from "lucide-react";

import Syaamil1 from "../assets/perusahaan.png";
import Syaamil2 from "../assets/perusahaan2.png";
import Syaamil3 from "../assets/perusahaan1.png";
import Syaamil4 from "../assets/jobfair.jpeg"

const images = [Syaamil1, Syaamil2, Syaamil3, Syaamil4];
const SLIDE_DURATION = 4000;
const FADE_DURATION = 300;

function About() {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);

  const nextSlide = useCallback(() => {
    setFade(false);
    setTimeout(() => {
      setCurrent((prev) => (prev + 1) % images.length);
      setFade(true);
    }, FADE_DURATION);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, SLIDE_DURATION);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <section className="relative text-black py-16 lg:py-20 w-full">
      {/* Background Gradient Blur */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-400/50 via-blue-400/50 to-blue-500/50 blur-3xl opacity-30"></div>

      {/* Main Content */}
      <div className="relative z-10 w-full flex flex-col lg:flex-row items-center gap-12 px-4 sm:px-8 lg:px-23">
        
        {/* === DESKTOP IMAGE SLIDER (kiri) === */}
        <div className="hidden lg:flex flex-1 relative w-full max-w-xl lg:max-w-none order-1">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={images[current]}
              alt="Tentang Syaamil Group"
              className={`w-full h-[550px] object-cover transition-opacity duration-[300ms]`}
              style={{ opacity: fade ? 1 : 0 }}
            />
          </div>
        </div>

        {/* === TEXT SECTION (kanan) === */}
        <div className="flex-1 space-y-6 order-2 lg:order-2">
          {/* Header */}
          <div className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full px-4 py-2 text-black font-semibold text-sm transition duration-300 shadow-lg border border-white/30">
            <Building2 className="h-4 w-4 text-sky-600" />
            Tentang Perusahaan
          </div>

          {/* Mobile Image Slider → muncul hanya di mobile */}
          <div className="lg:hidden relative w-full max-w-xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl mt-4">
              <img
                src={images[current]}
                alt="Tentang Syaamil Group"
                className={`w-full h-48 sm:h-64 object-cover transition-opacity duration-[300ms]`}
                style={{ opacity: fade ? 1 : 0 }}
              />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-900 drop-shadow-md">
            Perusahaan <span className="text-sky-600">Syaamil Group</span>
          </h2>

          {/* Descriptions */}
          <p className="text-base sm:text-md leading-relaxed text-justify text-gray-700">
            Syaamil Group merupakan perusahaan yang bergerak dalam berbagai
            bidang, menghadirkan inovasi dan peluang kerja bagi talenta muda
            untuk berkembang bersama membangun masa depan.
          </p>
          <p className="text-base sm:text-md leading-relaxed text-justify text-gray-700">
            Kami percaya bahwa sumber daya manusia adalah aset utama, sehingga
            kami senantiasa berkomitmen untuk menciptakan lingkungan kerja yang
            nyaman, kolaboratif, dan penuh semangat.
          </p>

          {/* Visi & Misi */}
          <div className="space-y-6 pt-4">
            <div className="bg-white/70 rounded-xl p-6 shadow-xl hover:shadow-2xl transition duration-300 border-l-4 border-sky-500 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-sky-600" />
                <h3 className="text-lg font-bold text-gray-900">Visi</h3>
              </div>
              <p className="text-gray-700 leading-relaxed text-justify sm:text-md">
                Menjadi Perusahaan yang terdepan dalam Membumikan Al Qur’an & Menghidupkan Sirah.
              </p>
            </div>

            <div className="bg-white/70 rounded-xl p-6 shadow-xl hover:shadow-2xl transition duration-300 border-l-4 border-orange-500 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <Flag className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-bold text-gray-900">Misi</h3>
              </div>
              <p className="text-gray-700 leading-relaxed text-justify sm:text-md">
                Mewujudkan perusahaan yang penuh keberkahan, siap menghadapi
                tantangan global, dan berkomitmen untuk menyebarkan nilai-nilai
                Islam secara mudah dan menyenangkan.
              </p>
            </div>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-2 gap-6 pt-6">
            <div className="bg-white/70 rounded-xl p-4 text-center shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition duration-300 backdrop-blur-sm border-t-2 border-sky-500">
              <Users className="h-8 w-8 text-sky-600 mx-auto mb-2" />
              <div className="font-bold text-lg text-gray-800">Tim Profesional</div>
              <div className="text-gray-600 text-sm">Berpengalaman</div>
            </div>

            <div className="bg-white/70 rounded-xl p-4 text-center shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition duration-300 backdrop-blur-sm border-t-2 border-sky-500">
              <BookOpen className="h-8 w-8 text-sky-600 mx-auto mb-2" />
              <div className="font-bold text-lg text-gray-800">Pendidikan Islam</div>
              <div className="text-gray-600 text-sm">Berkualitas Tinggi</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
