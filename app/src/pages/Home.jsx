import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import Hero1 from "../assets/hero.png";
import Hero2 from "../assets/hero1.jpeg";
import Hero3 from "../assets/hero2.jpeg";

const images = [
  { src: Hero1, type: "landscape" },
  { src: Hero2, type: "portrait" },
  { src: Hero3, type: "portrait" },
];

export default function HeroSlider() {
  const [index, setIndex] = useState(0);

  // auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const prev = () =>
    setIndex((prev) => (prev - 1 + images.length) % images.length);

  const next = () => setIndex((prev) => (prev + 1) % images.length);

  return (
    <div className="relative w-full max-w-[520px] mx-auto">
      {/* Frame */}
      <div className="relative overflow-hidden rounded-2xl shadow-xl bg-gradient-to-br from-primary/20 to-secondary/20 p-4">
        {/* Slides */}
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {images.map((img, i) => (
            <div
              key={i}
              className="min-w-full flex justify-center items-center"
            >
              <img
                src={img.src}
                alt={`Hero ${i + 1}`}
                className={`
                  rounded-xl object-cover shadow-lg
                  ${
                    img.type === "landscape"
                      ? "w-full h-[280px] md:h-[360px]"
                      : "w-[260px] h-[360px] md:w-[300px] md:h-[420px]"
                  }
                `}
              />
            </div>
          ))}
        </div>

        {/* Navigation */}
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-700 p-2 rounded-full shadow"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-700 p-2 rounded-full shadow"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2 w-2 rounded-full transition ${
              index === i ? "bg-primary w-5" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
