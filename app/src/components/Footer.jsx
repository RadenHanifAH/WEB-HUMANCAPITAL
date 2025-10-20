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
    // Gradien dari Putih ke Biru Muda (blue-200) agar lebih terlihat
    <footer className="bg-gradient-to-b from-white to-blue-300 text-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* KOLOM 1: Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src={Logo} alt="Syaamil Group" className="h-10" />
            </div>
            <p className="text-sm leading-relaxed">
              Membumikan Quran, Menghidupkan Sirah
            </p>
          </div>

          {/* KOLOM 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Tautan Cepat</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-sky-600 transition-colors">
                  Lowongan Kerja
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-sky-600 transition-colors">
                  Tentang Kami
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-sky-600 transition-colors">
                  Budaya Kerja
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-sky-600 transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-sky-600 transition-colors">
                  Kontak
                </a>
              </li>
            </ul>
          </div>

          {/* KOLOM 3: Contact Info (Head Office) */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Head Office</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-sky-600 mt-0.5 flex-shrink-0" />
                <span>
                  Jl. Babakan Sari 1 No.71 <br />
                  Kiaracondong, Bandung 40283, Jawa Barat, Indonesia
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-sky-600" />
                <span>+62 22 720 8298</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-sky-600" />
                <span>info@syaamilgroup.id</span>
              </div>
            </div>
          </div>
          
          {/* KOLOM 4: Ikon Media Sosial (Rata Kanan) */}
          <div className="space-y-4 pt-4 lg:pt-0">
            <h3 className="font-semibold text-lg hidden lg:block invisible">Placeholder</h3> 
            
            <div className="flex justify-start lg:justify-end gap-4"> 
              <a
                href="#"
                className="p-2 rounded-full border border-gray-500/50 hover:bg-sky-600 hover:text-white transition-colors" 
              >
                <FaFacebookF className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full border border-gray-500/50 hover:bg-sky-600 hover:text-white transition-colors"
              >
                <FaYoutube className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full border border-gray-500/50 hover:bg-sky-600 hover:text-white transition-colors"
              >
                <FaInstagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full border border-gray-500/50 hover:bg-sky-600 hover:text-white transition-colors"
              >
                <FaLinkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-10">
          <div className="flex justify-center items-center text-sm w-full">
            <p className="text-center text-gray-800">
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