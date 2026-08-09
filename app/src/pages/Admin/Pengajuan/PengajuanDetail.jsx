/* eslint-disable no-unused-vars */
// app/src/pages/Admin/Pengajuan/PengajuanDetail.jsx
import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  X,
  Building2,
  CalendarDays,
  Users,
  Briefcase,
  GraduationCap,
  Globe,
  Gift,
  BarChart3,
  ListChecks,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  PencilLine,
} from "lucide-react";
import PengajuanBadge from "./PengajuanBadge";
import { approvePengajuan, rejectPengajuan } from "./PengajuanService";

export default function PengajuanDetail({ pengajuan, onClose, onAction }) {
  const [catatan, setCatatan] = useState("");
  const [loadingAction, setLoadingAction] = useState(null); // "approve" | "reject"
  const [error, setError] = useState("");

  const isPending = pengajuan.status === "PENDING";
  const isUrgent = pengajuan.jumlah >= 3;

  // Prisma Json field sudah otomatis ter-parse jadi array/object,
  // jaga-jaga saja kalau null / bukan array.
  const safeArray = (val) => (Array.isArray(val) ? val : []);

  const formatTanggal = (d) =>
    d
      ? new Date(d).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "—";

  // ✅ Toast pengingat, muncul di KIRI BAWAH layar, mengingatkan admin
  // untuk segera mengedit draft lowongan yang baru dibuat otomatis dari
  // pengajuan SDM ini. Pakai react-hot-toast yang sudah global lewat
  // <Toaster /> di App.jsx — tidak butuh Provider/Context tambahan apa pun.
  const showEditLowonganReminder = (jobTitle) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible
              ? "animate-in slide-in-from-left-5 fade-in"
              : "animate-out fade-out"
          } bg-white border border-amber-200 rounded-xl shadow-lg flex items-start gap-3 p-4 w-full max-w-sm`}
        >
          <span className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <PencilLine className="w-4 h-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-800">
              Jangan lupa edit lowongan!
            </p>
            <p className="text-sm text-gray-600 mt-0.5">
              Lowongan{jobTitle ? ` "${jobTitle}"` : ""} dibuat sebagai draft.
              Cek & lengkapi detailnya sebelum dipublikasikan ke pelamar.
            </p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-gray-300 hover:text-gray-500 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ),
      { position: "bottom-left", duration: 8000 },
    );
  };

  const handleApprove = async () => {
    setError("");
    setLoadingAction("approve");
    try {
      const result = await approvePengajuan(pengajuan.id, catatan);

      // Backend: { data: { pengajuan, job } }, job.judul sesuai model `lowongan`
      const jobTitle = result?.data?.job?.judul || pengajuan.posisi;
      showEditLowonganReminder(jobTitle);

      onAction?.();
    } catch (e) {
      setError(e.message || "Gagal menyetujui pengajuan");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReject = async () => {
    setError("");
    if (!catatan.trim()) {
      setError("Catatan wajib diisi saat menolak pengajuan.");
      return;
    }
    setLoadingAction("reject");
    try {
      await rejectPengajuan(pengajuan.id, catatan);
      onAction?.();
    } catch (e) {
      setError(e.message || "Gagal menolak pengajuan");
    } finally {
      setLoadingAction(null);
    }
  };

  // Semua field di bawah persis nama kolom model `pengajuan_sdm` di schema.prisma
  const tugasUtama = safeArray(pengajuan.tugas_utama);
  const keahlian = safeArray(pengajuan.keahlian);
  const komputerSkills = safeArray(pengajuan.keahlian_komputer);
  const fasilitas = safeArray(pengajuan.fasilitas);
  const petaKekuatan = safeArray(pengajuan.peta_kekuatan);
  const statusPerkawinan = safeArray(pengajuan.status_perkawinan);

  // Relasi: pengguna { id, nama, email }, ditinjau_oleh { id, nama }
  const namaPengaju = pengajuan.pengguna?.nama;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
      {/* ── Header ── */}
      <div className="px-5 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                Detail Pengajuan
              </span>
              {isUrgent && (
                <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-2.5 h-2.5" /> Urgent
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-gray-900 leading-tight truncate">
              {pengajuan.posisi}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              {pengajuan.departemen || "—"}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <PengajuanBadge status={pengajuan.status} />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Meta chips */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          <Chip
            icon={CalendarDays}
            text={formatTanggal(pengajuan.tanggal_permintaan)}
          />
          <Chip icon={Users} text={`${pengajuan.jumlah} Orang`} />
          {pengajuan.status_karyawan && (
            <Chip icon={Briefcase} text={pengajuan.status_karyawan} />
          )}
          {namaPengaju && <Chip icon={User} text={namaPengaju} />}
        </div>
      </div>

      {/* ── Scrollable Body ── */}
      <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5 max-h-[calc(100vh-380px)]">
        {/* Alasan */}
        {pengajuan.alasan && (
          <Section icon={AlertTriangle} title="Alasan Permintaan">
            <p className="text-sm text-gray-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5 leading-relaxed">
              {pengajuan.alasan}
            </p>
          </Section>
        )}

        {/* Tugas Utama */}
        {tugasUtama.length > 0 && (
          <Section icon={ListChecks} title="Tugas Utama">
            <ul className="space-y-1.5">
              {tugasUtama.map((t, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-gray-700"
                >
                  <span className="w-4 h-4 rounded-full bg-sky-100 text-sky-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Kualifikasi */}
        <Section icon={GraduationCap} title="Kualifikasi Utama">
          <div className="space-y-2 text-sm">
            {pengajuan.pendidikan_terakhir && (
              <KVRow label="Pendidikan" value={pengajuan.pendidikan_terakhir} />
            )}
            {(pengajuan.usia_min || pengajuan.usia_maks) && (
              <KVRow
                label="Usia"
                value={`${pengajuan.usia_min ?? "—"}–${pengajuan.usia_maks ?? "—"} tahun`}
              />
            )}
            {statusPerkawinan.length > 0 && (
              <KVRow label="Status Nikah" value={statusPerkawinan.join(", ")} />
            )}
            {pengajuan.pengalaman && (
              <KVRow label="Pengalaman" value={pengajuan.pengalaman} />
            )}
            {keahlian.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Keahlian</p>
                <div className="flex flex-wrap gap-1.5">
                  {keahlian.map((k, i) => (
                    <Tag key={i}>{k}</Tag>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* Bahasa & Komputer */}
        {(pengajuan.bahasa_asing || komputerSkills.length > 0) && (
          <Section icon={Globe} title="Bahasa & Komputer">
            <div className="space-y-2 text-sm">
              {pengajuan.bahasa_asing && (
                <KVRow
                  label="Bahasa Asing"
                  value={`${pengajuan.bahasa_asing} — ${pengajuan.level_bahasa_asing}`}
                />
              )}
              {komputerSkills.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">Komputer</p>
                  <div className="flex flex-wrap gap-1.5">
                    {komputerSkills.map((k, i) => (
                      <Tag key={i}>{k}</Tag>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Fasilitas */}
        {fasilitas.length > 0 && (
          <Section icon={Gift} title="Fasilitas">
            <p className="text-sm text-sky-700 leading-relaxed">
              {fasilitas.join(", ")}
            </p>
          </Section>
        )}

        {/* Peta Kekuatan */}
        {petaKekuatan.length > 0 && (
          <Section icon={BarChart3} title="Peta Kekuatan">
            <div className="rounded-lg border border-gray-100 overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">Level</th>
                    <th className="text-center px-3 py-2 font-medium">
                      Kebutuhan
                    </th>
                    <th className="text-center px-3 py-2 font-medium">
                      Existing
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {petaKekuatan.map((row, i) => (
                    <tr key={i} className="text-gray-700">
                      <td className="px-3 py-2">{row.level}</td>
                      <td className="px-3 py-2 text-center font-semibold text-sky-600">
                        {row.kebutuhan}
                      </td>
                      <td className="px-3 py-2 text-center font-semibold text-emerald-600">
                        {row.existing}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        )}

        {/* Catatan Admin (readonly jika sudah di-review) */}
        {pengajuan.catatan_admin && (
          <Section icon={CheckCircle2} title="Catatan Admin">
            <p className="text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5">
              {pengajuan.catatan_admin}
            </p>
          </Section>
        )}

        {/* Submitted at */}
        {pengajuan.created_at && (
          <p className="text-xs text-gray-400">
            Disubmit:{" "}
            {new Date(pengajuan.created_at).toLocaleString("id-ID", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        )}
      </div>

      {/* ── Action Footer (hanya PENDING) ── */}
      {isPending && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-3 bg-gray-50/50">
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">
              Catatan Admin
            </label>
            <textarea
              value={catatan}
              onChange={(e) => {
                setCatatan(e.target.value);
                setError("");
              }}
              rows={3}
              placeholder="Tambahkan catatan verifikasi atau alasan penolakan..."
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none bg-white"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={!!loadingAction}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 border-red-300 text-red-600 text-sm font-semibold hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              {loadingAction === "reject" ? "Menolak..." : "Tolak"}
            </button>
            <button
              onClick={handleApprove}
              disabled={!!loadingAction}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 disabled:opacity-50 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              {loadingAction === "approve" ? "Menyetujui..." : "Terima"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function Section({ icon: Icon, title, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5 text-gray-400" />
        <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function KVRow({ label, value }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-gray-400 shrink-0 w-28 text-xs pt-0.5">
        {label}
      </span>
      <span className="text-gray-700 font-medium">{value}</span>
    </div>
  );
}

function Tag({ children }) {
  return (
    <span className="text-xs bg-sky-50 text-sky-700 border border-sky-100 px-2 py-0.5 rounded-full">
      {children}
    </span>
  );
}

function Chip({ icon: Icon, text }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
      <Icon className="w-3 h-3" />
      {text}
    </span>
  );
}
