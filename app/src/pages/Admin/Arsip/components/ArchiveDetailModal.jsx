import React, { useMemo } from "react";
import {
  X,
  Mail,
  Phone,
  MapPin,
  Hash,
  UserCheck,
  User,
  CalendarDays,
  ChevronRight,
  Download,
  Briefcase,
  GraduationCap,
  Users as OrgIcon,
  Award,
  Sparkles,
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react";

const MONTHS = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

const formatDate = (val) => {
  if (!val) return "-";
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
};

const formatMonthYear = (val) => {
  if (!val) return "-";
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return "-";
  return MONTHS[d.getMonth()] + " " + d.getFullYear();
};

const formatDuration = (startDate, endDate, isCurrent) => {
  if (!startDate) return "";
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return "";
  const end = isCurrent ? new Date() : endDate ? new Date(endDate) : null;
  if (!end || Number.isNaN(end.getTime())) return "";
  let totalMonths =
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (totalMonths < 0) totalMonths = 0;
  const years = Math.floor(totalMonths / 12);
  const remMonths = totalMonths % 12;
  const parts = [];
  if (years > 0) parts.push(years + " thn");
  if (remMonths > 0) parts.push(remMonths + " bln");
  return parts.join(" ");
};

const hasValue = (v) => String(v ?? "").trim().length > 0;

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const resolveFileUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return BASE_URL + path;
};

const SectionHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 mb-4">
    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-sky-50 text-sky-600">
      {Icon && <Icon className="h-4 w-4" />}
    </span>
    <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
  </div>
);

const Field = ({ label, value, icon: Icon, full }) => (
  <div className={`${full ? "md:col-span-2" : ""} min-w-0`}>
    <p className="text-xs text-gray-400 mb-1">{label}</p>
    <div className="flex items-start gap-2 text-gray-900 min-w-0">
      {Icon && <Icon className="h-4 w-4 text-sky-500 mt-0.5 shrink-0" />}
      <span className="font-semibold text-sm leading-snug break-all">{value || "-"}</span>
    </div>
  </div>
);

const Card = ({ children, className }) => (
  <div className={"bg-white rounded-2xl border border-gray-100 shadow-sm p-5 " + (className || "")}>
    {children}
  </div>
);

const EmptyRow = ({ text }) => (
  <p className="text-sm text-gray-400 italic">{text}</p>
);

const DocRow = ({ ok, okLabel, badLabel, href }) => (
  <div className={"flex items-center justify-between gap-3 px-2 py-2 rounded-lg " + (ok ? "" : "bg-red-50")}>
    <div className="flex items-center gap-3">
      {ok
        ? <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
        : <XCircle className="h-5 w-5 text-red-500 shrink-0" />
      }
      <span className={"text-sm font-medium " + (ok ? "text-gray-800" : "text-red-600")}>
        {ok ? okLabel : badLabel}
      </span>
    </div>
    {ok && href && (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-sky-600">
        <Download className="h-4 w-4" />
      </a>
    )}
  </div>
);

export default function ArchiveDetailModal({ isOpen, loading, data, onClose }) {
  if (!isOpen) return null;

  const profile = data?.profile || null;

  // ⚠️ Data mentah dari Prisma pakai nama field Bahasa Indonesia
  // (pengalaman_kerja, pendidikan, organisasi, sertifikat, keahlian_pengguna
  // di-include apa adanya di archives.service.js, tidak di-mapping ke Inggris)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const extra = useMemo(() => ({
    workExperiences: data?.workExperiences || [],
    educations: data?.educations || [],
    organizations: data?.organizations || [],
    certificates: data?.certificates || [],
    skills: data?.skills || [],
  }), [data]);

  const isHired = data?.finalStatus === "hired" || data?.finalStatus === "accepted";
  const isRejected = data?.finalStatus === "rejected";

  const statusLabel = isHired ? "Diterima" : isRejected ? "Ditolak" : data?.finalStatus || "-";
  const statusColor = isHired
    ? "bg-green-100 text-green-700"
    : isRejected
    ? "bg-red-100 text-red-700"
    : "bg-gray-100 text-gray-600";

  const isProfileComplete = profile
    ? [profile.NIK, profile.gender, profile.nomorHp, profile.tempatLahir, profile.tanggalLahir, profile.alamat]
        .every((x) => hasValue(x))
    : false;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999] p-4 backdrop-blur-sm">
      <div className="bg-gray-50 rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative">

        {/* Sticky Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 sticky top-0 bg-gray-50/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-1 text-sm">
            <span className="text-gray-400 font-medium">Arsip</span>
            <ChevronRight className="h-4 w-4 text-gray-300" />
            <span className="text-sky-600 font-semibold">Detail Pelamar</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">Memuat detail...</div>
        ) : !data ? (
          <div className="text-center py-20 text-gray-400 text-sm">Data tidak ditemukan</div>
        ) : (
          <div className="px-6 pb-6 space-y-6">

            {/* Identity Card */}
            <Card>
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  {profile?.fotoProfile ? (
                    <img
                      src={profile.fotoProfile}
                      alt="Foto Profil"
                      className="w-16 h-16 rounded-full object-cover border-2 border-sky-100"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-sky-100">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-gray-900 truncate">
                    {data.name || "-"}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-sm text-gray-500">{data.position || "-"}</span>
                    <span className="text-gray-300">·</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor}`}>
                      {statusLabel}
                    </span>
                  </div>
                  {data.decisionDate && (
                    <p className="text-xs text-gray-400 mt-1">
                      Keputusan: {formatDate(data.decisionDate)}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
              {/* Kolom Kiri */}
              <div className="space-y-6">

                {/* Biodata */}
                <Card>
                  <SectionHeader icon={User} title="Biodata Diri" />
                  <div className="grid grid-cols-2 gap-y-5 gap-x-6">
                    <Field label="NIK" value={profile?.NIK} icon={Hash} />
                    <Field
                      label="Jenis Kelamin"
                      value={
                        profile?.gender === "L" ? "Laki-laki"
                        : profile?.gender === "P" ? "Perempuan"
                        : profile?.gender
                      }
                      icon={UserCheck}
                    />
                    <Field label="Tempat Lahir" value={profile?.tempatLahir} icon={MapPin} />
                    <Field
                      label="Tanggal Lahir"
                      value={profile?.tanggalLahir ? formatDate(profile.tanggalLahir) : "-"}
                      icon={CalendarDays}
                    />
                  </div>
                </Card>

                {/* Kontak */}
                <Card>
                  <SectionHeader icon={MapPin} title="Kontak & Lokasi" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
                    <Field label="Email" value={data.email} icon={Mail} />
                    <Field label="No. Handphone" value={profile?.nomorHp} icon={Phone} />
                    <Field label="Alamat Domisili" value={profile?.alamat} icon={MapPin} full={true} />
                  </div>
                </Card>

                {/* Tentang */}
                <Card>
                  <SectionHeader icon={Sparkles} title="Tentang Saya" />
                  {profile?.about && hasValue(profile.about) ? (
                    <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{profile.about}</p>
                  ) : (
                    <EmptyRow text="Belum ada deskripsi tentang diri." />
                  )}
                </Card>

                {/* Pengalaman Kerja — model: pengalaman_kerja (jabatan, perusahaan, jenis_pekerjaan, bulan/tahun_mulai, bulan/tahun_selesai, sedang_bekerja, lokasi) */}
                <Card>
                  <SectionHeader icon={Briefcase} title="Pengalaman Kerja" />
                  {extra.workExperiences.length === 0 ? (
                    <EmptyRow text="Belum ada pengalaman kerja." />
                  ) : (
                    <div className="space-y-4">
                      {extra.workExperiences.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="w-2 h-2 rounded-full bg-sky-400 mt-2 shrink-0" />
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm">{item.jabatan}</h4>
                            <p className="text-sm text-gray-600">
                              {item.perusahaan}{item.jenis_pekerjaan ? " · " + item.jenis_pekerjaan : ""}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {item.bulan_mulai && item.tahun_mulai
                                ? MONTHS[item.bulan_mulai - 1] + " " + item.tahun_mulai
                                : "-"}{" "}
                              -{" "}
                              {item.sedang_bekerja
                                ? "Sekarang"
                                : item.bulan_selesai && item.tahun_selesai
                                ? MONTHS[item.bulan_selesai - 1] + " " + item.tahun_selesai
                                : "-"}
                            </p>
                            {item.lokasi && <p className="text-xs text-gray-400">{item.lokasi}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Pendidikan — model: pendidikan (institusi, gelar, jurusan, tanggal_mulai, tanggal_selesai, sedang_berlangsung) — tidak ada field deskripsi */}
                <Card>
                  <SectionHeader icon={GraduationCap} title="Pendidikan" />
                  {extra.educations.length === 0 ? (
                    <EmptyRow text="Belum ada data pendidikan." />
                  ) : (
                    <div className="space-y-4">
                      {extra.educations.map((item) => {
                        const dur = formatDuration(item.tanggal_mulai, item.tanggal_selesai, item.sedang_berlangsung);
                        return (
                          <div key={item.id} className="flex gap-3">
                            <div className="w-2 h-2 rounded-full bg-sky-400 mt-2 shrink-0" />
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm">{item.institusi}</h4>
                              <p className="text-sm text-gray-600">
                                {[item.gelar, item.jurusan].filter(Boolean).join(" - ") || "-"}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatMonthYear(item.tanggal_mulai)} -{" "}
                                {item.sedang_berlangsung ? "Sekarang" : formatMonthYear(item.tanggal_selesai)}
                                {dur ? " · " + dur : ""}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>

                {/* Organisasi — model: organisasi (peran, nama_organisasi, tanggal_mulai, tanggal_selesai, sedang_berlangsung, deskripsi) */}
                <Card>
                  <SectionHeader icon={OrgIcon} title="Pengalaman Organisasi" />
                  {extra.organizations.length === 0 ? (
                    <EmptyRow text="Belum ada pengalaman organisasi." />
                  ) : (
                    <div className="space-y-4">
                      {extra.organizations.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="w-2 h-2 rounded-full bg-sky-400 mt-2 shrink-0" />
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm">{item.peran}</h4>
                            <p className="text-sm text-gray-600">{item.nama_organisasi}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatMonthYear(item.tanggal_mulai)} -{" "}
                              {item.sedang_berlangsung ? "Sekarang" : formatMonthYear(item.tanggal_selesai)}
                            </p>
                            {item.deskripsi && (
                              <p className="text-sm text-gray-500 mt-1 whitespace-pre-line">{item.deskripsi}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Sertifikat — model: sertifikat (nama, penerbit, diterbitkan, kadaluarsa, file_sertifikat) */}
                <Card>
                  <SectionHeader icon={Award} title="Sertifikat" />
                  {extra.certificates.length === 0 ? (
                    <EmptyRow text="Belum ada sertifikat." />
                  ) : (
                    <div className="space-y-4">
                      {extra.certificates.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="w-2 h-2 rounded-full bg-sky-400 mt-2 shrink-0" />
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm">{item.nama}</h4>
                            <p className="text-sm text-gray-600">
                              {item.penerbit}{item.diterbitkan ? " · Dikeluarkan " + formatMonthYear(item.diterbitkan) : ""}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {item.kadaluarsa
                                ? "Berlaku hingga " + formatMonthYear(item.kadaluarsa)
                                : "Tidak memiliki batas waktu masa aktif"}
                            </p>
                            {item.file_sertifikat && (
                              <a
                                href={resolveFileUrl(item.file_sertifikat)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm font-medium text-sky-600 hover:text-sky-700 mt-1"
                              >
                                Lihat Sertifikat <Download className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Skills — model: keahlian_pengguna (nama) */}
                <Card>
                  <SectionHeader icon={Sparkles} title="Skills" />
                  {extra.skills.length === 0 ? (
                    <EmptyRow text="Belum ada skills." />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {extra.skills.map((s) => (
                        <span
                          key={s.id || s.nama}
                          className="bg-sky-50 text-sky-700 text-xs font-medium px-3 py-1.5 rounded-full border border-sky-100"
                        >
                          {s.nama}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* Kolom Kanan */}
              <div className="space-y-6">

                {/* Status Keputusan */}
                <Card>
                  <h3 className="text-sm font-bold text-gray-900 mb-4">Hasil Seleksi</h3>
                  <div className="flex flex-col items-center gap-3 py-4">
                    <span className={`flex items-center justify-center w-16 h-16 rounded-full ${isHired ? "bg-green-100" : "bg-red-100"}`}>
                      {isHired
                        ? <CheckCircle className="w-8 h-8 text-green-600" />
                        : <XCircle className="w-8 h-8 text-red-500" />
                      }
                    </span>
                    <p className={`text-base font-bold ${isHired ? "text-green-700" : "text-red-600"}`}>
                      {statusLabel}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(data.decisionDate)}</p>
                  </div>

                  {data.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Catatan</p>
                          <p className="text-sm text-gray-700 whitespace-pre-line">{data.notes}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Kelengkapan Dokumen */}
                <Card>
                  <h3 className="text-sm font-bold text-gray-900 mb-4">Kelengkapan Dokumen</h3>
                  <div className="space-y-1">
                    <DocRow
                      ok={isProfileComplete}
                      okLabel="Data Pribadi Lengkap"
                      badLabel="Data Pribadi Belum Lengkap"
                    />
                    <DocRow
                      ok={Boolean(data.cvDownloadUrl)}
                      okLabel="CV Terupload"
                      badLabel="CV Belum Diupload"
                      href={data.cvDownloadUrl ? `${BASE_URL}${data.cvDownloadUrl}` : null}
                    />
                    <DocRow
                      ok={Boolean(data.portfolioDownloadUrl)}
                      okLabel="Portofolio Terupload"
                      badLabel="Portofolio Belum Diupload"
                      href={data.portfolioDownloadUrl ? `${BASE_URL}${data.portfolioDownloadUrl}` : null}
                    />
                    <DocRow
                      ok={extra.certificates.length > 0}
                      okLabel="Sertifikat"
                      badLabel="Belum Ada Sertifikat"
                    />
                  </div>
                </Card>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}