import { MapPin, Phone, Mail } from "lucide-react";
import {
  FaFacebookF,
  FaYoutube,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import Logo from "../assets/logo.png";

export default function Footer() {
  return (
    <footer className="bg-sky-100 border-t border-sky-200 text-gray-700">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* LOGO */}
          <div className="space-y-3">
            <img src={Logo} alt="Syaamil Group" className="h-10" />
            <p className="text-sm text-gray-600">
              Membumikan Quran, Menghidupkan Sirah
            </p>
          </div>

          {/* TAUTAN */}
          <div>
            <h3 className="font-semibold mb-3 text-gray-800">
              Tautan Cepat
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/lowongan" className="hover:text-sky-600">
                  Lowongan Kerja
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-sky-600">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-sky-600">
                  Budaya Kerja
                </Link>
              </li>
              <li>
                <Link to="/kontak" className="hover:text-sky-600">
                  Kontak
                </Link>
              </li>
            </ul>
          </div>

          {/* OFFICE */}
          <div>
            <h3 className="font-semibold mb-3 text-gray-800">
              Head Office
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <MapPin className="w-4 h-4 text-sky-600 mt-1" />
                <span>
                  Jl. Babakan Sari I No.71 <br />
                  Kiaracondong, Bandung 40283
                </span>
              </div>
              <div className="flex gap-2">
                <Phone className="w-4 h-4 text-sky-600" />
                <span>+62 22 720 8298</span>
              </div>
              <div className="flex gap-2">
                <Mail className="w-4 h-4 text-sky-600" />
                <span>syaamilhc@gmail.com</span>
              </div>
            </div>
          </div>

          {/* SOSMED */}
          <div className="flex gap-3 lg:justify-end">
            {[
              {
                href: "https://www.facebook.com/SyaamilQuranOfficial/",
                icon: <FaFacebookF />,
              },
              {
                href: "https://www.youtube.com/syaamilquran",
                icon: <FaYoutube />,
              },
              {
                href: "https://www.instagram.com/syaamil_quran/",
                icon: <FaInstagram />,
              },
              {
                href: "https://www.linkedin.com/company/syaamil-group/",
                icon: <FaLinkedin />,
              },
            ].map((item, i) => (
              <a
                key={i}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-400/50 hover:bg-sky-600 hover:text-white transition"
              >
                {item.icon}
              </a>
            ))}
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="mt-8 pt-4 border-t border-sky-200 text-center text-sm text-gray-600">
          © 2026 <strong>syaamilgroup.id</strong> All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
