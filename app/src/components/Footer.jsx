import React from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import {
  FaFacebookF,
  FaYoutube,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import Logo from "../assets/logo.png";

function Footer() {
  return (
    <footer className="bg-gradient-to-b from-white to-blue-300 text-gray-800">
      {/* ⬇️ py-12 ➜ py-8 */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* KOLOM 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src={Logo} alt="Syaamil Group" className="h-10" />
            </div>
            <p className="text-sm leading-relaxed">
              Membumikan Quran, Menghidupkan Sirah
            </p>
          </div>

          {/* KOLOM 2 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Tautan Cepat</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/lowongan"
                  className="hover:text-sky-600 transition-colors"
                >
                  Lowongan Kerja
                </Link>
              </li>

              <li>
                <Link
                  to="/"
                  state={{ scrollTo: "about", key: Date.now() }}
                  className="hover:text-sky-600 transition-colors"
                >
                  Tentang Kami
                </Link>
              </li>

              <li>
                <Link
                  to="/"
                  state={{ scrollTo: "culture", key: Date.now() }}
                  className="hover:text-sky-600 transition-colors"
                >
                  Budaya Kerja
                </Link>
              </li>

              <li>
                <a
                  href="/kontak"
                  className="hover:text-sky-600 transition-colors"
                >
                  Kontak
                </a>
              </li>
            </ul>
          </div>

          {/* KOLOM 3 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Head Office</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-sky-600 mt-0.5" />
                <span>
                  Jl. Babakan Sari 1 No.71 <br />
                  Kiaracondong, Bandung 40283
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-sky-600" />
                <span>+62 22 720 8298</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-sky-600" />
                <span>syaamilhc@gmail.com</span>
              </div>
            </div>
          </div>

          {/* KOLOM 4 */}
          {/* ⬇️ pt-4 DIHAPUS */}
          <div className="flex items-center justify-start lg:justify-end gap-4">
            <a
              href="https://www.facebook.com/SyaamilQuranOfficial/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-500/50 hover:bg-sky-600 hover:text-white transition-colors"
            >
              <FaFacebookF className="h-5 w-5" />
            </a>

            <a
              href="https://www.youtube.com/syaamilquran"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-500/50 hover:bg-sky-600 hover:text-white transition-colors"
            >
              <FaYoutube className="h-5 w-5" />
            </a>

            <a
              href="https://www.instagram.com/syaamil_quran/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-500/50 hover:bg-sky-600 hover:text-white transition-colors"
            >
              <FaInstagram className="h-5 w-5" />
            </a>

            <a
              href="https://www.linkedin.com/company/syaamil-group/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-500/50 hover:bg-sky-600 hover:text-white transition-colors"
            >
              <FaLinkedin className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* ⬇️ mt-10 pt-10 ➜ mt-6 pt-6 */}
        <div className="mt-6 pt-6 text-center text-sm">
          © 2026 <strong>syaamilgroup.id</strong> All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
