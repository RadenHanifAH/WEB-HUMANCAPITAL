import { UserPlus, FileText, Send, BellRing, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const STEPS = [
  {
    nomor: "1",
    icon: UserPlus,
    judul: "Daftar / Masuk Akun",
    deskripsi:
      "Buat akun pelamar baru, atau masuk jika kamu sudah terdaftar di Syaamil Group.",
  },
  {
    nomor: "2",
    icon: FileText,
    judul: "Lengkapi Profil",
    deskripsi:
      "Isi data diri, pendidikan, dan pengalaman kerja, lalu unggah CV serta dokumen pendukung.",
  },
  {
    nomor: "3",
    icon: Send,
    judul: "Pilih Lowongan & Lamar",
    deskripsi:
      "Temukan posisi yang sesuai dengan keahlianmu, lalu kirim lamaran langsung dari detail lowongan.",
  },
  {
    nomor: "4",
    icon: BellRing,
    judul: "Pantau Proses Seleksi",
    deskripsi:
      "Cek status lamaran dan undangan wawancara langsung dari dashboard akunmu.",
  },
];

export default function CaraMelamar() {
  return (
    <div>
      {/* Header Section */}
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="mt-4 text-2xl font-bold text-gray-800 md:text-3xl">
          Tata Cara Melamar Kerja
        </h2>
        <p className="mt-3 text-base text-muted-foreground">
          Hanya 4 langkah mudah untuk bergabung bersama Syaamil Group —
          Sahabat Sampai Surga.
        </p>
      </div>

      {/* Langkah-langkah */}
      <div className="relative mt-10 md:mt-14">
        {/* Garis penghubung antar langkah (hanya desktop) */}
        <div className="absolute left-0 right-0 top-16 hidden border-t-2 border-dashed border-sky-200 lg:block" />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.nomor}
                className="relative rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Icon + nomor */}
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-700 to-sky-600 text-white shadow-lg">
                  <Icon className="h-8 w-8" />
                  <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 text-xs font-bold text-white shadow">
                    {step.nomor}
                  </span>
                </div>

                <h3 className="mt-5 text-base font-bold text-gray-800">
                  {step.judul}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.deskripsi}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-10 text-center">
        <Link
          to="/lowongan"
          className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-sky-700 to-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition transform hover:scale-[1.03] hover:from-sky-800 hover:to-sky-600 md:text-base"
        >
          Mulai Lamar Sekarang
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}