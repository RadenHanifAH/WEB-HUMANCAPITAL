import React from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import {
  FaFacebookF,
  FaYoutube,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";
import Logo from "../assets/logo.png"; // ganti path sesuai lokasi logo kamu

function Footer() {
  return (
    <footer className="bg-gradient-to-t from-sky-900 to-white text-black">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src={Logo} alt="Syaamil Group" className="h-10" />
            </div>
            <p className="text-sm leading-relaxed">
              Membumikan Quran, Menghidupkan Sirah
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="p-2 rounded-full border border-white/30 hover:bg-orange-500 transition-colors"
              >
                <FaFacebookF className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full border border-white/30 hover:bg-orange-500 transition-colors"
              >
                <FaYoutube className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full border border-white/30 hover:bg-orange-500 transition-colors"
              >
                <FaInstagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full border border-white/30 hover:bg-orange-500 transition-colors"
              >
                <FaLinkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Tautan Cepat</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-orange-400 transition-colors">
                  Lowongan Kerja
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-400 transition-colors">
                  Tentang Kami
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-400 transition-colors">
                  Budaya Kerja
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-400 transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-400 transition-colors">
                  Kontak
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Head Office</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <span>
                  Jl. Babakan Sari 1 No.71 <br />
                  Kiaracondong, Bandung 40283, Jawa Barat, Indonesia
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-orange-400" />
                <span>+62 22 720 8298</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-orange-400" />
                <span>info@syaamilgroup.id</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-10">
          <div className="flex justify-center items-center text-sm text-blue-100 w-full">
            <p className="text-center">
              © 2025 <span className="font-semibold">syaamilgroup.id</span> All
              Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
