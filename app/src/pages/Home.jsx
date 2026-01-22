import React, { useEffect } from "react";
import { ArrowRight, Users, Award, BookOpen } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { scroller } from "react-scroll";
import Hero from "../assets/hero.png";
import Jobs from "./Jobs";
import About from "../components/About";
import Core from "../components/Corevalue";

function Home() {
  const location = useLocation();

  // Auto scroll kalau ada state dari Navbar
  useEffect(() => {
    if (location.state?.scrollTo) {
      scroller.scrollTo(location.state.scrollTo, {
        smooth: true,
        duration: 500,
        offset: -80, // sesuaikan tinggi navbar
      });
    }
  }, [location.state?.key]); // ✅ PENTING

  return (
    <div id="top">
      {/* Bagian Hero */}
      <section className="relative py-12 md:py-20 px-4 md:ml-9 md:mr-4 bg-gradient-to-br from-card to-background">
        <div className="container mx-auto md:px-17">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 items-center">
            {/* Bagian Kiri */}
            <div className="flex flex-col justify-center min-h-[400px] md:min-h-[500px] space-y-6 text-center lg:text-left">
              <div className="space-y-4">
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  <span className="text-gray-800">Bersama </span>{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-yellow-500">
                    Syaamil Group
                  </span>{" "}
                  <span className="text-gray-800">Sahabat Sampai Surga</span>
                </h1>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  Kembangkan bakatmu, berkontribusi nyata, dan tumbuh dalam tim
                  yang mendukung setiap langkah kebaikanmu.
                </p>
              </div>

              {/* Tombol */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/lowongan"
                  // Menggunakan kelas gradient: bg-gradient-to-r dari Sky-500 ke Sky-700
                  className="px-5 py-2.5 md:px-6 md:py-3 bg-gradient-to-r from-sky-700 to-sky-600 hover:from-sky-800 hover:to-sky-600 text-white rounded-lg text-sm md:text-base font-semibold flex items-center justify-center transition shadow-lg transform hover:scale-[1.03]"
                >
                  Lihat Lowongan Kerja
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>

              {/* Statistik */}
              <div className="grid grid-cols-3 gap-4 md:gap-6 gap-y-6 md:gap-y-8 pt-6 md:pt-8">
                <div className="text-center">
                  <Users className="h-6 w-6 md:h-8 md:w-8 mx-auto text-primary mb-1 md:mb-2" />
                  <div className="text-xl md:text-2xl font-bold text-primary">
                    500+
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">
                    Karyawan
                  </div>
                </div>
                <div className="text-center">
                  <Award className="h-6 w-6 md:h-8 md:w-8 mx-auto text-primary mb-1 md:mb-2" />
                  <div className="text-xl md:text-2xl font-bold text-primary">
                    25+
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">
                    Pengalaman
                  </div>
                </div>
                <div className="text-center">
                  <BookOpen className="h-6 w-6 md:h-8 md:w-8 mx-auto text-primary mb-1 md:mb-2" />
                  <div className="text-xl md:text-2xl font-bold text-primary">
                    1000+
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">
                    Buku Diterbitkan
                  </div>
                </div>
              </div>
            </div>

            {/* Bagian Kanan */}
            <div className="relative justify-center hidden md:flex">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 p-4 md:p-6">
                <img
                  src={Hero}
                  alt="Syaamil Group"
                  className="
        w-[220px] h-[220px] 
        md:w-[500px] md:h-[500px] 
        object-cover rounded-2xl shadow-xl
      "
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bagian Kategori & Tentang Kami */}
      <section className="py-13 md:py-8">
        <div className="container mx-auto px-4 md:px-8">
          {/* Kategori Pekerjaan */}
          <Jobs />

          {/* Tentang Kami */}
          <section id="about" className="mt-16 md:mt-20">
            <About />
          </section>

          {/* Core Value */}
          <section id="culture" className="mt-16 md:mt-20">
            <Core />
          </section>
        </div>
      </section>
    </div>
  );
}

export default Home;
