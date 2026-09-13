import React, { useMemo } from "react";
import {
  MapPin,
  Briefcase,
  Calendar,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/useAuthStore";

const resolveApplicationDisplay = (applicationStatus) => {
  const statusRaw = String(applicationStatus?.status || "");
  const tahapRaw = String(applicationStatus?.tahap || "");
  const low = statusRaw.toLowerCase();

  const isRejected = low.startsWith("rejected-at-") || low.includes("ditolak");
  const isAccepted = low === "diterima" || low.includes("accept") || low.includes("diterima");

  if (isRejected) {
    return {
      label: "Ditolak",
      sublabel: tahapRaw ? `Tidak lolos pada tahap ${tahapRaw}` : null,
      dotClass: "bg-red-600",
      textClass: "text-red-700",
      boxClass: "border-red-100 bg-red-50",
    };
  }

  if (isAccepted) {
    return {
      label: "Diterima",
      sublabel: null,
      dotClass: "bg-green-600",
      textClass: "text-green-700",
      boxClass: "border-green-100 bg-green-50",
    };
  }

  return {
    label: tahapRaw || "-",
    sublabel: null,
    dotClass: "bg-sky-600",
    textClass: "text-sky-700",
    boxClass: "border-sky-100 bg-sky-50",
  };
};

/* ── ✅ NEW: hitung umur dari tanggal lahir ──────────────── */
const hitungUmur = (tanggalLahir) => {
  if (!tanggalLahir) return null;
  const lahir = new Date(tanggalLahir);
  if (Number.isNaN(lahir.getTime())) return null;

  const today = new Date();
  let umur = today.getFullYear() - lahir.getFullYear();
  const m = today.getMonth() - lahir.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < lahir.getDate())) umur -= 1;
  return umur;
};

/* ── ✅ NEW: kenali syarat umur dari lowongan ────────────── */
// 1) Kalau suatu saat ada field terstruktur (umur_minimal/umur_maksimal), pakai itu.
// 2) Kalau tidak ada, parse dari teks persyaratan (bentuk array bullet / string).
const parseRentangUmur = (job) => {
  // prioritas 1: field terstruktur (untuk masa depan, kalau ditambahkan di tabel lowongan)
  const minField = job?.umur_minimal ?? job?.min_umur ?? null;
  const maxField = job?.umur_maksimal ?? job?.max_umur ?? null;
  if (minField != null || maxField != null) {
    return {
      min: minField != null ? Number(minField) : null,
      max: maxField != null ? Number(maxField) : null,
    };
  }

  // prioritas 2: parse teks persyaratan
  const sumber = [job?.requirements, job?.persyaratan];
  const teks = sumber
    .map((r) => (Array.isArray(r) ? r.join(" ") : String(r || "")))
    .join(" ")
    .toLowerCase();

  if (!teks) return null;

  // pola rentang: "usia antara 19 hingga 30 tahun", "umur 19-30 tahun",
  // "usia 19 s/d 30 tahun", "umur antara 19 sampai 30 tahun", dst.
  const rentang = teks.match(
    /(?:usia|umur)[^\d]{0,25}(\d{1,2})\s*(?:-|–|—|s\/d|sd|sampai|hingga|ada)\s*(\d{1,2})\s*(?:tahun)?/
  );
  if (rentang) {
    const min = parseInt(rentang[1], 10);
    const max = parseInt(rentang[2], 10);
    if (min > 0 && max >= min && max <= 100) return { min, max };
  }

  // pola minimal: "usia minimal 19 tahun", "umur min 19 tahun"
  const minimal = teks.match(
    /(?:usia|umur)[^\d]{0,25}(?:minimal|min|di atas|diatas|lebih dari)\s*(\d{1,2})\s*(?:tahun)?/
  );

  // pola maksimal: "usia maksimal 30 tahun", "umur maks 30 tahun"
  const maksimal = teks.match(
    /(?:usia|umur)[^\d]{0,25}(?:maksimal|maximal|maks|max)\s*(\d{1,2})\s*(?:tahun)?/
  );

  const min = minimal ? parseInt(minimal[1], 10) : null;
  const max = maksimal ? parseInt(maksimal[1], 10) : null;

  if (min == null && max == null) return null;
  return {
    min: min && min > 0 && min <= 100 ? min : null,
    max: max && max > 0 && max <= 100 ? max : null,
  };
};

function JobDetail({
  job,
  onBack,
  formatDate,
  renderRequirements,
  submitting,
  handleApply,
  applicationStatus,
  profileReadiness,
  missingLabelsText,
}) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = Boolean(user);

  const isClosed = job.status === "closed";
  const profileIncomplete = !profileReadiness?.ready;

  /* ── ✅ NEW: pemeriksaan kesesuaian umur ───────────────── */
  const rentangUmur = useMemo(() => parseRentangUmur(job), [job]);
  const umurUser = useMemo(
    () => hitungUmur(user?.profil?.tanggal_lahir),
    [user]
  );

  const cekUmur = (() => {
    // belum login -> belum bisa dicek (tombol akan mengarah ke /login dulu)
    if (!isLoggedIn) return { status: "belum_dicek" };
    // lowongan tidak mencantumkan syarat umur -> bebas
    if (!rentangUmur) return { status: "bebas" };
    // profil belum ada tanggal lahir
    if (umurUser == null) return { status: "tanpa_tanggal" };
    if (rentangUmur.min != null && umurUser < rentangUmur.min)
      return { status: "di_bawah", batas: rentangUmur.min };
    if (rentangUmur.max != null && umurUser > rentangUmur.max)
      return { status: "di_atas", batas: rentangUmur.max };
    return { status: "lolos" };
  })();

  const umurTidakMemenuhi = [
    "di_bawah",
    "di_atas",
    "tanpa_tanggal",
  ].includes(cekUmur.status);

  // ✅ tombol nonaktif jika: lowongan ditutup, sedang submit,
  // umur tidak memenuhi, ATAU profil belum lengkap (yang sudah login)
  const applyDisabled =
    isClosed ||
    submitting ||
    umurTidakMemenuhi ||
    (isLoggedIn && profileIncomplete);

  const getButtonLabel = () => {
    if (isClosed) return "Lowongan Ditutup";
    if (submitting) return "Mengirim...";
    if (umurTidakMemenuhi) return "Umur Tidak Memenuhi Syarat";
    if (isLoggedIn && profileIncomplete)
      return "Lengkapi Profil Terlebih Dahulu";
    return "Lamar Sekarang";
  };

  // klik tombol saat belum login -> redirect ke halaman login
  const handleButtonClick = () => {
    if (!isLoggedIn) {
      navigate("/login", {
        state: { from: window.location.pathname + window.location.search },
      });
      return;
    }
    handleApply();
  };

  const display = applicationStatus
    ? resolveApplicationDisplay(applicationStatus)
    : null;

  return (
    <>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sky-600 mb-4 lg:hidden font-medium"
      >
        <ArrowLeft size={20} />
        Kembali ke Daftar Lowongan
      </button>

      <h2 className="text-2xl font-bold">{job.title}</h2>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 mb-4 gap-2 sm:gap-0">
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin size={16} />
            {job.location}
          </span>

          <span className="flex items-center gap-1">
            <Briefcase size={16} />
            {job.type}
          </span>
        </div>

        <span
          className={`flex items-center gap-1 font-semibold text-base ${
            job.status === "closed" ? "text-gray-500" : "text-red-600"
          }`}
        >
          <Calendar
            size={18}
            className={
              job.status === "closed" ? "text-gray-500" : "text-red-600"
            }
          />

          {job.status === "closed"
            ? "Ditutup"
            : `Deadline: ${formatDate(job.deadline)}`}
        </span>
      </div>

      <hr className="my-4" />

      <h3 className="font-semibold">Persyaratan:</h3>

      <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
        {renderRequirements(job.requirements)}
      </ul>

      <h3 className="font-semibold mt-4">Deskripsi:</h3>

      <p className="text-gray-700 mt-1 whitespace-pre-line">{job.description}</p>

      {/* STATUS LAMARAN */}
      {display && (
        <div className={`mt-6 rounded-xl border p-4 ${display.boxClass}`}>
          <p className="text-sm text-gray-500 mb-1">Status Lamaran</p>

          <div className="flex items-center gap-2">
            {display.label === "Ditolak" ? (
              <XCircle size={16} className="text-red-600" />
            ) : display.label === "Diterima" ? (
              <CheckCircle2 size={16} className="text-green-600" />
            ) : (
              <div className={`w-2.5 h-2.5 rounded-full ${display.dotClass}`} />
            )}

            <p className={`font-semibold ${display.textClass}`}>
              {display.label}
            </p>
          </div>

          {display.sublabel && (
            <p className="text-xs text-gray-500 mt-1">{display.sublabel}</p>
          )}
        </div>
      )}

      {/* FORM APPLY */}
      {!applicationStatus && (
        <>
          {/* ✅ NEW: pemberitahuan umur tidak memenuhi syarat */}
          {umurTidakMemenuhi && (
            <div className="mt-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <XCircle size={18} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">
                  Umur kamu tidak memenuhi persyaratan lowongan ini
                </p>
                <p className="mt-0.5">
                  {cekUmur.status === "di_bawah" &&
                    `Lowongan ini meminta usia minimal ${cekUmur.batas} tahun`}
                  {cekUmur.status === "di_atas" &&
                    `Lowongan ini hanya menerima usia maksimal ${cekUmur.batas} tahun`}
                  {cekUmur.status === "tanpa_tanggal" &&
                    "Lengkapi tanggal lahir pada halaman Profil agar sistem dapat memeriksa kesesuaian umur."}
                </p>
              </div>
            </div>
          )}

          {/* ✅ NEW: info kecil kalau umur lolos & lowongan mencantumkan syarat umur */}
          {isLoggedIn && cekUmur.status === "lolos" && rentangUmur && (
            <div className="mt-6 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
              <p>
                Usia kamu {umurUser} tahun — memenuhi syarat usia{" "}
                {rentangUmur.min ?? "?"}–{rentangUmur.max ?? "?"} tahun.
              </p>
            </div>
          )}

          {/* Peringatan profil kurang HANYA untuk yang sudah login */}
          {isLoggedIn && profileIncomplete && missingLabelsText && (
            <div className="mt-6 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <p>
                Lengkapi{" "}
                <span className="font-semibold">{missingLabelsText}</span> pada
                halaman Profil sebelum melamar.
              </p>
            </div>
          )}

          <button
            onClick={handleButtonClick}
            disabled={applyDisabled}
            className={`mt-4 px-6 py-2 rounded-lg text-white font-medium shadow transition ${
              applyDisabled
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-sky-700 to-sky-600 hover:from-sky-800 hover:to-sky-600"
            }`}
          >
            {getButtonLabel()}
          </button>
        </>
      )}
    </>
  );
}

export default JobDetail;