/* =========================================================
   LamaranSayaSection.jsx — Section "Lamaran Saya" (Pelamar)

   Gabungan dua bagian:
   1. Jadwal Seleksi & Konfirmasi Kehadiran — fetch dari
      GET /api/schedules/me, konfirmasi via
      PATCH /api/schedules/:id/confirm-applicant
   2. Riwayat Lamaran — fetch dari GET /api/applications/me,
      desain kartu (badge tahap/status, link download CV &
      Portfolio) mengikuti pola yang sudah dipakai di
      CertificateModal.jsx / DocumentsSayaSection.jsx.

   FIX yang sudah diterapkan sebelumnya (tetap dipertahankan):
   - token dibaca dari useAuthStore, fallback ke
     localStorage("accessToken") kalau state store belum sinkron.
   - Semua endpoint di-prefix "/api" sesuai app.js backend
     (app.use("/api/schedules", ...), app.use("/api/applications", ...)).
   - Endpoint lamaran yang benar adalah /api/applications/me
     (bukan /lamaran/me atau /application/me).

   ✅ PERUBAHAN BARU:
   - Judul section diubah dari "Jadwal Wawancara & Konfirmasi
     Kehadiran" menjadi "Jadwal Seleksi & Konfirmasi Kehadiran",
     karena jadwal yang muncul di sini tidak cuma wawancara
     (Interview Pertama/Kedua) tapi juga Psikotes — jadi "Jadwal
     Wawancara" kurang tepat mewakili semuanya.
   - Baris "± 60 menit" (durasi) di tiap kartu jadwal dihapus,
     diganti pesan "Harap datang 15 menit lebih awal" — durasi
     teknis kurang relevan buat pelamar, yang lebih berguna
     adalah pengingat supaya datang lebih awal.
   ========================================================= */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Briefcase, CalendarDays, CheckCircle2, Clock, ExternalLink, FileText,
  Loader2, MapPin, MessageSquareWarning, RefreshCw, Video, XCircle,
} from "lucide-react";
import useAuthStore from "../../../../../store/useAuthStore";

// ✅ BASE_URL = origin backend polos (TANPA "/api"), konsisten dengan
// konvensi yang dipakai di CertificateModal.jsx / DocumentsSayaSection.jsx.
// Prefix "/api" ditambahkan manual di setiap URL fetch/link di bawah.
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_URL = `${BASE_URL}/api`;

/* ============================================================
   Helper umum
   ============================================================ */

function pickList(data, ...keys) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  for (const k of keys) {
    if (Array.isArray(data[k])) return data[k];
  }
  return [];
}

/* ============================================================
   BAGIAN 1 — Jadwal Seleksi & Konfirmasi Kehadiran
   ============================================================ */

const SCHEDULE_TYPE_LABELS = {
  InterviewPertama: "Interview Pertama",
  InterviewHC: "Interview Pertama",     // alias, biar aman
  Psikotes: "Psikotes",
  InterviewKedua: "Interview Kedua",
  FinalInterview: "Interview Kedua",    // alias, biar aman
};

function formatDateTime(dt) {
  if (!dt) return "-";
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AttendanceBadge({ schedule }) {
  const a = schedule?.attendanceStatus;

  if (a === "hadir")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
        <CheckCircle2 size={14} /> Kehadiran dikonfirmasi
      </span>
    );

  if (a === "tidak_hadir")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
        <XCircle size={14} /> Tidak bisa hadir
      </span>
    );

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
      <Clock size={14} /> Menunggu konfirmasimu
    </span>
  );
}

function ScheduleCard({ schedule, onConfirm, confirmingId, onRequestFailed }) {
  const [showReason, setShowReason] = useState(false);
  const [reason, setReason] = useState("");

  const confirming = confirmingId === schedule.id;
  const cancelled = schedule.status === "canceled";
  const finished = schedule.isCompleted || schedule.status === "completed";
  const canConfirm =
    !cancelled &&
    !finished &&
    (!schedule.attendanceStatus || schedule.attendanceStatus === "pending");

  const submitHadir = () => onConfirm(schedule.id, "hadir", "");

  const submitTidakHadir = () => {
    if (!reason.trim()) {
      onRequestFailed?.("Isi dulu alasan kenapa tidak bisa hadir ya.");
      return;
    }
    onConfirm(schedule.id, "tidak_hadir", reason.trim());
    setShowReason(false);
    setReason("");
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-emerald-300 hover:shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-800">
            {SCHEDULE_TYPE_LABELS[schedule.type] || schedule.type || "Jadwal Seleksi"}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
            <Briefcase size={12} /> {schedule.position || schedule.posisi || "Posisi tidak dicantumkan"}
          </p>
        </div>
        <AttendanceBadge schedule={schedule} />
      </div>

      <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
        <p className="flex items-center gap-2">
          <CalendarDays size={15} className="shrink-0 text-emerald-600" />
          {formatDateTime(schedule.dateTime)}
        </p>
        {/* ✅ FIX: sebelumnya menampilkan durasi "± 60 menit", sekarang
            diganti pengingat supaya datang 15 menit lebih awal —
            lebih relevan buat pelamar dibanding angka durasi teknis. */}
        <p className="flex items-center gap-2">
          <Clock size={15} className="shrink-0 text-emerald-600" />
          Harap datang 15 menit lebih awal
        </p>
        {schedule.location ? (
          <p className="flex items-center gap-2">
            <MapPin size={15} className="shrink-0 text-emerald-600" />
            {schedule.location}
          </p>
        ) : null}
        {schedule.meetingLink ? (
          <a
            href={schedule.meetingLink}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 font-medium text-sky-600 hover:text-sky-700 hover:underline"
          >
            <Video size={15} className="shrink-0" /> Buka tautan rapat
            <ExternalLink size={12} />
          </a>
        ) : null}
      </div>

      {schedule.attendanceStatus === "tidak_hadir" && schedule.absentReason ? (
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">
          <MessageSquareWarning size={14} className="mt-0.5 shrink-0" />
          <span>
            <b>Alasan tidak hadir:</b> {schedule.absentReason}
          </span>
        </p>
      ) : null}

      {cancelled && (
        <p className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-500">
          Jadwal ini sudah dibatalkan oleh HRD.
        </p>
      )}

      {finished && !cancelled && (
        <p className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-500">
          Sesi ini sudah selesai dilaksanakan.
        </p>
      )}

      {canConfirm && (
        <div className="mt-4 border-t border-dashed border-slate-200 pt-3">
          {!showReason ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={submitHadir}
                disabled={confirming}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {confirming ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={14} />
                )}
                Ya, Saya Hadir
              </button>
              <button
                type="button"
                onClick={() => setShowReason(true)}
                disabled={confirming}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <XCircle size={14} /> Tidak Bisa Hadir
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="Tuliskan alasan kamu tidak bisa hadir (mis. ada kuliah, sakit, dsb.)"
                className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={submitTidakHadir}
                  disabled={confirming}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {confirming ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <XCircle size={14} />
                  )}
                  Kirim Konfirmasi
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReason(false);
                    setReason("");
                  }}
                  disabled={confirming}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   BAGIAN 2 — Riwayat Lamaran (desain baru, mengikuti
   CertificateModal.jsx / DocumentsSayaSection.jsx)
   ============================================================ */

const normalizeStage = (stage) => {
  const s = String(stage || "").trim().toLowerCase();
  if (!s) return "-";

  if (s === "under review" || s === "under-review" || s === "screening") return "Screaning";
  if (s === "psikotes") return "Psikotes/technical test";
  if (s.includes("technical")) return "Psikotes/technical test";

  if (s === "screaning") return "Screaning";
  if (s === "interview pertama") return "Interview Pertama";
  if (s === "interview kedua") return "Interview Kedua";
  if (s.includes("offering")) return "Final Result";

  return stage;
};

// Menangkap status Bahasa Indonesia ("ditolak", "diterima") maupun
// Inggris ("reject", "accept", "hired") supaya badge final selalu
// terwarnai dengan benar, tidak jatuh ke default abu-abu.
const getFinalBadge = (statusRaw) => {
  const s = String(statusRaw || "").trim().toLowerCase();
  if (!s) return null;

  if (s.includes("reject") || s.includes("ditolak"))
    return { text: "DITOLAK", cls: "bg-red-100 text-red-700" };

  if (s.includes("accept") || s.includes("hired") || s.includes("diterima"))
    return { text: "DITERIMA", cls: "bg-green-100 text-green-700" };

  return null;
};

const stageBadgeClass = (stage) => {
  const s = String(stage || "").toLowerCase();
  if (s.includes("screaning")) return "bg-yellow-100 text-yellow-700";
  if (s.includes("interview")) return "bg-blue-100 text-blue-700";
  if (s.includes("psikotes") || s.includes("technical")) return "bg-purple-100 text-purple-700";
  if (s.includes("final")) return "bg-sky-100 text-sky-700";
  if (s.includes("offering")) return "bg-green-100 text-green-700";
  return "bg-gray-100 text-gray-700";
};

const formatDateOnly = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
};

function LamaranCard({ app }) {
  // ✅ Field persis yang dikembalikan GET /api/applications/me:
  // id, status, tahap, tanggal_melamar, nama_cv, nama_portofolio,
  // lowongan: { id, judul }
  const stage = normalizeStage(app?.tahap);
  const finalBadge = getFinalBadge(app?.status);

  const badgeText = finalBadge?.text ?? stage;
  const badgeClass = finalBadge?.cls ?? stageBadgeClass(stage);

  const cvExists = Boolean(app?.nama_cv);
  const portfolioExists = Boolean(app?.nama_portofolio);

  // Endpoint /applications/me tidak mengirim URL download, jadi
  // dibangun manual mengarah ke route yang sama dipakai admin:
  // GET /api/applications/:id/file?type=cv|portfolio
  const cvDownloadUrl = cvExists
    ? `${API_URL}/applications/${app.id}/file?type=cv`
    : null;
  const portfolioDownloadUrl = portfolioExists
    ? `${API_URL}/applications/${app.id}/file?type=portfolio`
    : null;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 p-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="truncate text-lg font-bold text-gray-900">
          {app?.lowongan?.judul || "-"}
        </p>

        <p className="mt-1 text-sm text-gray-600">
          Tanggal Lamar: {formatDateOnly(app?.tanggal_melamar)}
        </p>

        <div className="mt-3 flex flex-wrap gap-6 text-sm text-gray-700">
          {/* CV */}
          <div>
            <span className="font-semibold">CV:</span>{" "}
            {cvExists ? (
              <a
                href={cvDownloadUrl}
                className="font-semibold text-sky-700 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                Tersimpan
              </a>
            ) : (
              "—"
            )}
            {app?.nama_cv ? (
              <span className="ml-2 text-xs text-gray-500">({app.nama_cv})</span>
            ) : null}
          </div>

          {/* Portfolio (opsional) */}
          <div>
            <span className="font-semibold">Portfolio:</span>{" "}
            {portfolioExists ? (
              <a
                href={portfolioDownloadUrl}
                className="font-semibold text-sky-700 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                Tersimpan
              </a>
            ) : (
              "—"
            )}
            {app?.nama_portofolio ? (
              <span className="ml-2 text-xs text-gray-500">({app.nama_portofolio})</span>
            ) : null}
          </div>
        </div>

        {finalBadge?.text === "DITOLAK" && stage !== "-" && (
          <p className="mt-2 text-xs text-gray-500">
            Ditolak pada tahap: <span className="font-semibold">{stage}</span>
          </p>
        )}
      </div>

      <span className={`shrink-0 self-start rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
        {badgeText}
      </span>
    </div>
  );
}

/* ============================================================
   Section utama
   ============================================================ */
function LamaranSayaSection() {
  // token dibaca dari useAuthStore, fallback ke localStorage kalau
  // state store belum sempat sinkron (lihat useAuthStore.js).
  const storeToken = useAuthStore((s) => s.token);
  const token = storeToken || localStorage.getItem("accessToken") || null;

  /* --- state jadwal --- */
  const [schedules, setSchedules] = useState([]);
  const [schLoading, setSchLoading] = useState(true);
  const [schError, setSchError] = useState("");
  const [confirmingId, setConfirmingId] = useState(null);
  const [notice, setNotice] = useState(null); // { text, ok }

  /* --- state lamaran --- */
  const [applications, setApplications] = useState([]);
  const [lamaranLoading, setLamaranLoading] = useState(true);
  const [lamaranError, setLamaranError] = useState("");

  const _toScheduleClientShape = (s) => ({
    id: s.id,
    applicationId: s.applicationId ?? s.lamaran_id,
    position: s.position ?? s.posisi,
    type: s.type ?? s.jenis,
    status: s.status,
    dateTime: s.dateTime ?? s.tanggal_waktu,
    durationMin: s.durationMin ?? s.durasi_menit,
    location: s.location ?? s.lokasi,
    meetingLink: s.meetingLink ?? s.tautan_rapat,
    isCompleted: s.isCompleted ?? s.sudah_selesai,
    attendanceStatus: s.attendanceStatus ?? s.status_kehadiran,
    absentReason: s.absentReason ?? s.alasan_tidak_hadir,
  });

  /* ---------- Ambil jadwal milik pelamar yang login ---------- */
  const loadSchedules = useCallback(async () => {
    if (!token) {
      setSchLoading(false);
      setSchError("Sesi login tidak ditemukan. Coba login ulang.");
      return;
    }
    setSchLoading(true);
    setSchError("");
    try {
      const res = await fetch(`${API_URL}/schedules/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Gagal memuat jadwal seleksi.");

      const list = pickList(data, "items", "data", "schedules", "jadwal");
      setSchedules(list.map(_toScheduleClientShape));
    } catch (e) {
      setSchError(e.message || "Terjadi kesalahan.");
    } finally {
      setSchLoading(false);
    }
  }, [token]);

  /* ---------- Ambil daftar lamaran milik pelamar ---------- */
  const loadApplications = useCallback(async () => {
    if (!token) {
      setLamaranLoading(false);
      setLamaranError("Sesi login tidak ditemukan. Coba login ulang.");
      return;
    }
    setLamaranLoading(true);
    setLamaranError("");
    try {
      const res = await fetch(`${API_URL}/applications/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Gagal memuat daftar lamaran.");

      setApplications(pickList(data, "items", "data", "applications"));
    } catch (e) {
      setLamaranError(e.message || "Terjadi kesalahan.");
    } finally {
      setLamaranLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadSchedules();
    loadApplications();
  }, [loadSchedules, loadApplications]);

  /* ---------- Konfirmasi kehadiran (Hadir / Tidak Bisa) ---------- */
  const handleConfirm = async (id, status, alasan) => {
    if (!token) {
      setNotice({ text: "Sesi kamu sudah habis, silakan login ulang.", ok: false });
      return;
    }
    setConfirmingId(id);
    setNotice(null);
    try {
      const res = await fetch(`${API_URL}/schedules/${id}/confirm-applicant`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          attendanceStatus: status, // "hadir" | "tidak_hadir"
          ...(status === "tidak_hadir" ? { absentReason: alasan } : {}),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Gagal mengonfirmasi jadwal.");

      setSchedules((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                attendanceStatus: status,
                absentReason: status === "tidak_hadir" ? alasan : s.absentReason,
              }
            : s
        )
      );
      setNotice({
        text:
          status === "hadir"
            ? "Terima kasih! Kehadiranmu sudah dikonfirmasi ke HRD."
            : "Baik, HRD akan diberi tahu bahwa kamu tidak bisa hadir.",
        ok: true,
      });
    } catch (e) {
      setNotice({ text: e.message || "Terjadi kesalahan saat konfirmasi.", ok: false });
    } finally {
      setConfirmingId(null);
    }
  };

  const sortedSchedules = useMemo(
    () =>
      [...schedules].sort(
        (a, b) =>
          (a.dateTime ? new Date(a.dateTime).getTime() : 0) -
          (b.dateTime ? new Date(b.dateTime).getTime() : 0)
      ),
    [schedules]
  );

  return (
    <div className="space-y-6">
      {/* ================= JADWAL + KONFIRMASI ================= */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            {/* ✅ FIX: judul diganti dari "Jadwal Wawancara & Konfirmasi
                Kehadiran" karena section ini juga menampilkan jadwal
                Psikotes, bukan cuma wawancara. */}
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-800">
              <CalendarDays size={18} className="text-emerald-600" />
              Jadwal Seleksi &amp; Konfirmasi Kehadiran
            </h3>
          </div>
          <button
            type="button"
            onClick={loadSchedules}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <RefreshCw size={13} /> Muat ulang
          </button>
        </header>

        <div className="space-y-3 p-5">
          {notice && (
            <p
              className={`rounded-lg px-3 py-2 text-xs font-medium ${
                notice.ok
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
              }`}
            >
              {notice.text}
            </p>
          )}

          {schLoading ? (
            <p className="flex items-center gap-2 py-6 text-sm text-slate-500">
              <Loader2 size={16} className="animate-spin" /> Memuat jadwal...
            </p>
          ) : schError ? (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
              {schError}
            </p>
          ) : sortedSchedules.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              Belum ada jadwal seleksi. Jadwal dari HRD akan muncul di sini.
            </p>
          ) : (
            sortedSchedules.map((s) => (
              <ScheduleCard
                key={s.id ?? s.applicationId}
                schedule={s}
                onConfirm={handleConfirm}
                confirmingId={confirmingId}
                onRequestFailed={(msg) => setNotice({ text: msg, ok: false })}
              />
            ))
          )}
        </div>
      </section>

      {/* ================= RIWAYAT LAMARAN (desain baru) ================= */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-xl sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Lamaran Saya</h3>
            <p className="mt-1 text-sm text-gray-500">
              Riwayat lamaran yang pernah Anda kirim.
            </p>
          </div>
          <button
            type="button"
            onClick={loadApplications}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <RefreshCw size={13} /> Muat ulang
          </button>
        </div>

        {lamaranLoading ? (
          <p className="mt-6 flex items-center gap-2 text-sm text-slate-500">
            <Loader2 size={16} className="animate-spin" /> Memuat lamaran...
          </p>
        ) : lamaranError ? (
          <p className="mt-6 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
            {lamaranError}
          </p>
        ) : applications.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed p-5 text-sm text-gray-500">
            Anda belum pernah mengirim lamaran.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {applications.map((app) => (
              <LamaranCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export { LamaranSayaSection };
export default LamaranSayaSection;