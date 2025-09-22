import React, { useState, useEffect } from "react";
import { ArrowRight, Users, Award, BookOpen, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { scroller } from "react-scroll";
import Hero from "../assets/hero.png";
import Jobs from "../components/Jobs";
import About from "../components/About";
import Core from "../components/Corevalue";

function Home() {
  const [query, setQuery] = useState("");
  const location = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    window.location.href = `/lowongan?search=${encodeURIComponent(query)}`;
  };

  // Auto scroll kalau ada state dari Navbar
  useEffect(() => {
    if (location.state?.scrollTo) {
      scroller.scrollTo(location.state.scrollTo, {
        smooth: true,
        duration: 500,
        offset: -80,
      });
    }
  }, [location.state]);

  return (
    <div id="top">
      {/* Bagian Hero */}
      <section className="relative py-20 bg-gradient-to-br from-card to-background">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Bagian Kiri */}
            <div className="flex flex-col justify-center min-h-[500px] space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                  Bersama Syaamil{" "}
                  <span className="text-orange-600">Group Sahabat Sampai</span>{" "}
                  Surga
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Kembangkan bakatmu, berkontribusi nyata, dan tumbuh dalam tim
                  yang mendukung setiap langkah kebaikanmu.
                </p>
              </div>

              {/* Tombol */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/lowongan"
                  className="px-6 py-3 bg-sky-700 hover:bg-sky-600 text-white rounded-lg text-base flex items-center justify-center transition"
                >
                  Lihat Lowongan Kerja
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>

              {/* Statistik */}
              <div className="grid grid-cols-3 gap-6 gap-y-8 pt-8">
                <div className="text-center">
                  <Users className="h-8 w-8 mx-auto text-primary mb-2" />
                  <div className="text-2xl font-bold text-primary">500+</div>
                  <div className="text-sm text-muted-foreground">Karyawan</div>
                </div>
                <div className="text-center">
                  <Award className="h-8 w-8 mx-auto text-primary mb-2" />
                  <div className="text-2xl font-bold text-primary">25+</div>
                  <div className="text-sm text-muted-foreground">
                    Tahun Pengalaman
                  </div>
                </div>
                <div className="text-center">
                  <BookOpen className="h-8 w-8 mx-auto text-primary mb-2" />
                  <div className="text-2xl font-bold text-primary">1000+</div>
                  <div className="text-sm text-muted-foreground">
                    Buku Diterbitkan
                  </div>
                </div>
              </div>
            </div>

            {/* Bagian Kanan */}
            <div className="relative flex justify-center">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 p-6">
                <img
                  src={Hero}
                  alt="Syaamil Group"
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bagian Cari Lowongan & Kategori */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-8">
          {/* Search Bar */}
          <div className="flex justify-center mb-12">
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row items-center w-full max-w-5xl bg-white border rounded-lg shadow px-4 py-3 gap-3"
            >
              <div className="flex items-center flex-1 w-full">
                <Search className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Cari Lowongan..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full outline-none text-gray-700 placeholder-gray-400"
                />
              </div>
              <button
                type="submit"
                className="bg-sky-700 hover:bg-sky-600 text-white px-6 py-3 rounded-lg transition w-full sm:w-auto"
              >
                Cari Pekerjaan
              </button>
            </form>
          </div>

          {/* Kategori Pekerjaan */}
          <Jobs />

          {/* Tentang Kami */}
          <section id="about" className="mt-20">
            <About />
          </section>

          {/* Core Value */}
          <section id="culture" className="mt-20">
            <Core />
          </section>
        </div>
      </section>
    </div>
  );
}

export default Home;
