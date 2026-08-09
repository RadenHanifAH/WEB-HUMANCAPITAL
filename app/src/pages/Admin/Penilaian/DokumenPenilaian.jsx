/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  User,
  Brain,
  ClipboardCheck,
  Star,
  MapPin,
  Mail,
  Briefcase,
  FileText,
} from "lucide-react";
import usePenilaianStore from "./store/usePenilaianStore";
import {
  generateInterviewPdf,
  generatePsikotestPdf,
} from "./utils/pdfGenerators";
import PdfPreviewModal from "./components/PdfPreviewModal";

// ✅ Label & warna badge tahap seleksi di kartu daftar pelamar, mendukung
// nama LAMA (Interview HC, Final Interview, dst) & nama BARU sekaligus,
// sinkron dengan VALID_STAGES di application.service.js.
const STAGE_BADGE = {
  Screaning: { label: "Screening", tone: "bg-gray-100 text-gray-600" },
  "Interview Pertama": {
    label: "Interview Tahap 1",
    tone: "bg-blue-50 text-blue-600",
  },
  "Interview HC": {
    label: "Interview Tahap 1",
    tone: "bg-blue-50 text-blue-600",
  },
  Psikotes: { label: "Psikotes", tone: "bg-amber-50 text-amber-600" },
  "Psikotes/Technical Test": {
    label: "Psikotes",
    tone: "bg-amber-50 text-amber-600",
  },
  "Interview Kedua": {
    label: "Interview Tahap 2",
    tone: "bg-indigo-50 text-indigo-600",
  },
  "Final Interview": {
    label: "Interview Tahap 2",
    tone: "bg-indigo-50 text-indigo-600",
  },
  "Final Result": { label: "Final Result", tone: "bg-green-50 text-green-600" },
};

const formatRelativeTime = (dateInput) => {
  if (!dateInput) return "-";
  const date = new Date(dateInput);
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return "Kemarin";
  if (diffDay < 7) return `${diffDay} hari lalu`;
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");

const Avatar = ({ name, src, size = 44 }) =>
  src ? (
    <img
      src={src}
      alt={name}
      className="rounded-full object-cover shrink-0"
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      className="rounded-full bg-slate-800 text-white flex items-center justify-center font-semibold shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials(name) || <User size={size * 0.5} />}
    </div>
  );

const StageBadge = ({ stage }) => {
  const meta = STAGE_BADGE[stage] || {
    label: stage || "-",
    tone: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${meta.tone}`}
    >
      {meta.label}
    </span>
  );
};

// ⛔ FIX: SummaryCard (kartu bordered untuk Skor Akhir / Kesimpulan / IQ Score)
// sudah tidak dipakai lagi di PsikotesTab sesuai permintaan, tapi komponennya
// tetap disimpan di sini kalau-kalau dibutuhkan lagi di tempat lain nanti.
const SummaryCard = ({ label, value, valueClass = "text-gray-900", sub }) => (
  <div className="border border-gray-100 rounded-xl p-4">
    <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1.5">
      {label}
    </p>
    <p className={`text-xl font-bold ${valueClass}`}>{value || "-"}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

/* ---------------------------------------------------------- */
/* Kartu Berkas — seluruh kartu bisa langsung diklik untuk buka */
/* preview PDF, tanpa tombol terpisah.                          */
/* ---------------------------------------------------------- */

const DocumentFileCard = ({
  title,
  subtitle,
  fileSizeLabel,
  colorClass,
  onPreview,
  disabled,
  icon: IconComp = FileText,
}) => (
  <button
    type="button"
    onClick={onPreview}
    disabled={disabled}
    className={`w-full flex items-center gap-4 border border-gray-100 rounded-xl p-4 text-left transition ${
      disabled
        ? "opacity-50 cursor-not-allowed"
        : "hover:border-gray-200 hover:shadow-sm hover:bg-gray-50/60 cursor-pointer"
    }`}
  >
    <span
      className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}
    >
      <IconComp size={20} />
    </span>
    <div className="min-w-0">
      <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>
      <p className="text-xs text-gray-400 truncate">{subtitle}</p>
      {fileSizeLabel && (
        <p className="text-[11px] text-gray-300 mt-0.5">{fileSizeLabel}</p>
      )}
    </div>
  </button>
);

/* ---------- Isi tab Psikotes: sekarang berupa berkas PDF ---------- */
// ✅ FIX: kartu ringkasan (Skor Akhir / Kesimpulan / IQ Score) dan baris
// info "Tanggal Test / Tester / Diperiksa" di bagian bawah DIHAPUS sesuai
// permintaan. Sekarang tab ini hanya menampilkan kartu berkas PDF-nya.
const PsikotesTab = ({ data, candidate, onOpenPdf }) => {
  if (!data) {
    return (
      <div className="py-12 text-center text-sm text-gray-400">
        Belum ada hasil psikotes untuk kandidat ini.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">
          Berkas Hasil Psikotest
        </p>
        <DocumentFileCard
          title={`Hasil Psikotest — ${candidate.applicantName}`}
          subtitle={`Diuji ${data.tanggalTest ? new Date(data.tanggalTest).toLocaleDateString("id-ID") : "-"} • ${data.tester || "Tester tidak diketahui"}`}
          colorClass="bg-amber-50 text-amber-600"
          onPreview={() =>
            onOpenPdf({
              fileName: `Psikotest_${candidate.applicantName.replace(/\s+/g, "_")}.pdf`,
              buildDoc: () => generatePsikotestPdf({ candidate, data }),
            })
          }
        />
      </div>
    </div>
  );
};

/* ---------- Isi tab Interview (dipakai untuk tahap 1 & 2): berupa berkas PDF ---------- */
// ✅ FIX: dokumen pendukung (foto/PDF) yang diunggah kandidat SUDAH
// digabungkan otomatis ke dalam PDF ringkasan wawancara oleh
// generateInterviewPdf (lihat utils/pdfGenerators.js) — jadi cukup 1 kartu
// berkas saja di sini, tidak perlu kartu terpisah untuk file upload lagi.
const InterviewTab = ({
  data,
  stageLabel,
  stageNumber,
  candidate,
  onOpenPdf,
}) => {
  if (!data) {
    return (
      <div className="py-12 text-center text-sm text-gray-400">
        Belum ada hasil {stageLabel} untuk kandidat ini.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">
          Berkas Hasil Wawancara
        </p>
        <DocumentFileCard
          title={`Hasil ${stageLabel} — ${candidate.applicantName}`}
          subtitle={
            data.tanggalWawancara
              ? `Diwawancara ${new Date(data.tanggalWawancara).toLocaleDateString("id-ID")}`
              : "-"
          }
          colorClass="bg-blue-50 text-blue-600"
          onPreview={() =>
            onOpenPdf({
              fileName: `${stageLabel.replace(/\s+/g, "_")}_${candidate.applicantName.replace(/\s+/g, "_")}.pdf`,
              buildDoc: () =>
                generateInterviewPdf({ candidate, data, stageLabel }),
            })
          }
        />
      </div>
    </div>
  );
};

const TABS = [
  { key: "interview1", label: "Interview Tahap 1", icon: ClipboardCheck },
  { key: "psikotes", label: "Psikotes", icon: Brain },
  { key: "interview2", label: "Interview Tahap 2", icon: Star },
];

const DokumenPenilaian = () => {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [activeDocTab, setActiveDocTab] = useState("interview1");

  // ✅ State untuk modal preview PDF (dokumen dibuat baru setiap kali dibuka)
  const [pdfModal, setPdfModal] = useState({
    open: false,
    fileName: "",
    buildDoc: null,
  });

  const { documentsList, documentsLoading, loadAssessmentDocuments } =
    usePenilaianStore();

  useEffect(() => {
    loadAssessmentDocuments();
  }, [loadAssessmentDocuments]);

  const filtered = useMemo(() => {
    if (!search.trim()) return documentsList;
    const q = search.trim().toLowerCase();
    return documentsList.filter(
      (d) =>
        d.applicantName.toLowerCase().includes(q) ||
        d.position.toLowerCase().includes(q),
    );
  }, [documentsList, search]);

  // Auto-pilih kandidat pertama begitu data list tersedia, supaya panel
  // kanan tidak kosong saat halaman pertama kali dibuka.
  useEffect(() => {
    if (!selectedId && filtered.length > 0) {
      setSelectedId(filtered[0].applicationId);
    }
  }, [filtered, selectedId]);

  const selected = filtered.find((d) => d.applicationId === selectedId) || null;

  // Badge "X Baru": kandidat yang salah satu hasil penilaiannya diperbarui
  // dalam 3 hari terakhir.
  const newCount = useMemo(() => {
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
    return documentsList.filter(
      (d) =>
        d.lastUpdatedAt &&
        Date.now() - new Date(d.lastUpdatedAt).getTime() < threeDaysMs,
    ).length;
  }, [documentsList]);

  // ✅ Dipanggil dari DocumentFileCard di masing-masing tab untuk membuka
  // preview PDF. `buildDoc` dieksekusi di dalam modal saat modal terbuka,
  // supaya PDF selalu dibuat ulang dari data terbaru.
  const handleOpenPdf = ({ fileName, buildDoc }) => {
    setPdfModal({ open: true, fileName, buildDoc });
  };

  const handleClosePdf = () => {
    setPdfModal({ open: false, fileName: "", buildDoc: null });
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-sky-900">Dokumen Penilaian</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
        {/* ---------- Kolom kiri: Daftar Pelamar ---------- */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-50">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
                size={16}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari dokumen atau pelamar..."
                className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Daftar Pelamar
            </p>
            {newCount > 0 && (
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                {newCount} Baru
              </span>
            )}
          </div>

          <div className="max-h-[70vh] overflow-y-auto px-2 pb-2">
            {documentsLoading && (
              <p className="text-sm text-gray-400 px-3 py-6 text-center">
                Memuat data...
              </p>
            )}
            {!documentsLoading && filtered.length === 0 && (
              <p className="text-sm text-gray-400 px-3 py-6 text-center">
                Belum ada dokumen penilaian.
              </p>
            )}
            {filtered.map((d) => {
              const active = d.applicationId === selectedId;
              return (
                <button
                  key={d.applicationId}
                  type="button"
                  onClick={() => {
                    setSelectedId(d.applicationId);
                    setActiveDocTab("interview1");
                  }}
                  className={`w-full text-left flex items-start gap-3 rounded-xl px-3 py-3 mb-1 transition ${
                    active ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                >
                  <Avatar
                    name={d.applicantName}
                    src={d.fotoProfile}
                    size={40}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {d.applicantName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {d.position}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <StageBadge stage={d.stage} />
                      <span className="text-[11px] text-gray-400 whitespace-nowrap">
                        {formatRelativeTime(d.lastUpdatedAt)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ---------- Kolom kanan: Detail kandidat terpilih ---------- */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          {!selected ? (
            <div className="py-24 text-center text-sm text-gray-400">
              Pilih salah satu pelamar untuk melihat dokumen penilaiannya.
            </div>
          ) : (
            <>
              <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <Avatar
                    name={selected.applicantName}
                    src={selected.fotoProfile}
                    size={56}
                  />
                  <div className="min-w-0">
                    <p className="text-base font-bold text-gray-900 truncate">
                      {selected.applicantName}
                    </p>
                    <p className="text-sm text-gray-500 truncate flex items-center gap-1.5">
                      <Briefcase size={13} className="shrink-0" />{" "}
                      {selected.position}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Mail size={12} /> {selected.email}
                      </span>
                      {selected.alamat && (
                        <span className="flex items-center gap-1 truncate max-w-[220px]">
                          <MapPin size={12} className="shrink-0" />{" "}
                          {selected.alamat}
                        </span>
                      )}
                    </div>
                    {selected.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {selected.skills.slice(0, 5).map((s) => (
                          <span
                            key={s}
                            className="text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 px-6 pt-4 border-b border-gray-50 overflow-x-auto">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeDocTab === tab.key;
                  const hasData =
                    tab.key === "psikotes"
                      ? !!selected.psikotest
                      : tab.key === "interview1"
                        ? !!selected.interview1
                        : !!selected.interview2;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveDocTab(tab.key)}
                      className={`relative flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition ${
                        active
                          ? "text-sky-600"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      <Icon size={14} />
                      {tab.label}
                      {!hasData && (
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 ml-1" />
                      )}
                      {active && (
                        <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-sky-600 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="p-6">
                {activeDocTab === "psikotes" && (
                  <PsikotesTab
                    data={selected.psikotest}
                    candidate={selected}
                    onOpenPdf={handleOpenPdf}
                  />
                )}
                {activeDocTab === "interview1" && (
                  <InterviewTab
                    data={selected.interview1}
                    stageLabel="Interview Tahap 1"
                    stageNumber={1}
                    candidate={selected}
                    onOpenPdf={handleOpenPdf}
                  />
                )}
                {activeDocTab === "interview2" && (
                  <InterviewTab
                    data={selected.interview2}
                    stageLabel="Interview Tahap 2"
                    stageNumber={2}
                    candidate={selected}
                    onOpenPdf={handleOpenPdf}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ✅ Modal preview PDF — dibuka langsung dengan mengklik kartu berkas */}
      <PdfPreviewModal
        open={pdfModal.open}
        onClose={handleClosePdf}
        buildDoc={pdfModal.buildDoc}
        fileName={pdfModal.fileName}
      />
    </div>
  );
};

export default DokumenPenilaian;
