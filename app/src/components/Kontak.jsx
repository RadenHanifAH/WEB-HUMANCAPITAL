// src/pages/Kontak.jsx
import React from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";

export default function Kontak() {
  return (
    <div className="w-full bg-white">
      <div className="container mx-auto px-4 md:px-8 py-14 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* ================= LEFT: INFO ================= */}
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Kantor Pusat
            </h1>

            {/* underline */}
            <div className="mt-6 h-[3px] w-14 bg-orange-500" />

            {/* Detail list */}
            <div className="mt-14 space-y-7">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="text-gray-800 leading-relaxed">
                  <div>Jl. Babakan Sari 1 No. 71 Kiaracondong Bandung</div>
                  <div>40283</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="text-gray-800 leading-relaxed">
                  <div>Telp. +62 898-9207-324</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="text-gray-800 leading-relaxed">
                    <div className="text-gray-800 leading-relaxed"> 
                        syaamilhc@gmail.com
                    </div>
                </div>
              </div>
            </div>

            {/* Social */}
            <div className="mt-14">
              <h2 className="text-2xl font-extrabold text-gray-900">
                Media Sosial
              </h2>

              <div className="mt-6 flex items-center gap-4">
                <a
                  href="https://www.facebook.com/SyaamilQuranOfficial/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white shadow-sm hover:opacity-90 transition"
                >
                  <FaFacebookF className="h-5 w-5" />
                </a>

                <a
                  href="https://www.instagram.com/syaamil_quran/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white shadow-sm hover:opacity-90 transition"
                >
                  <FaInstagram className="h-5 w-5" />
                </a>

                <a
                  href="https://www.youtube.com/syaamilquran"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white shadow-sm hover:opacity-90 transition"
                >
                  <FaYoutube className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* ================= RIGHT: MAP ================= */}
          <div className="w-full">
            <div className="w-full overflow-hidden rounded-md">
              {/* Rasio mirip gambar: tinggi map besar */}
              <div className="relative w-full h-[420px] md:h-[520px] lg:h-[560px]">
                <iframe
                  title="Google Maps - Kantor Pusat"
                  className="absolute inset-0 h-full w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://www.google.com/maps?q=Jl.%20Babakan%20Sari%201%20No.%2071%20Kiaracondong%20Bandung%2040283&output=embed"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
