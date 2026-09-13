/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  User,
  CheckCircle2,
  XCircle,
  ClipboardList,
  Wallet,
  PenLine,
} from "lucide-react";
import usePenilaianStore from "./store/usePenilaianStore";
import CandidateSearchInput from "./components/Candidatesearchinput";
import {
  KESIMPULAN_INTERVIEW_OPTIONS,
  INTERVIEW_STAGE_LABELS,
  RATING_OPTIONS,
  PENILAIAN_ASPEK_TEMPLATE,
} from "./utils/constants";

const buildDefaultPenilaian = () =>
  PENILAIAN_ASPEK_TEMPLATE.map((row) => ({
    aspek: row.aspek,
    uraian: row.uraian,
    nilai: "",
    keterangan: "",
  }));

// Menggabungkan penilaian yang sudah tersimpan (mis. dari backend) dengan
// template aspek, supaya urutan & uraian selalu konsisten dengan formulir,
// walau data lama hanya menyimpan { aspek, nilai, keterangan }.
const normalizePenilaian = (penilaian) => {
  if (!Array.isArray(penilaian) || penilaian.length === 0) {
    return buildDefaultPenilaian();
  }
  return PENILAIAN_ASPEK_TEMPLATE.map((row) => {
    const existing = penilaian.find((p) => p.aspek === row.aspek);
    return {
      aspek: row.aspek,
      uraian: row.uraian,
      nilai: existing?.nilai || "",
      keterangan: existing?.keterangan || "",
    };
  });
};

const initialForm = {
  id: null,
  lamaran_id: "",
  tahap: 1,
  nama_pelamar: "",
  tanggal_lahir: "",
  usia: "",
  pendidikan_terakhir: "",
  pengalaman_kerja: "",
  bidang_pengalaman: "",
  jabatan_dilamar: "",
  tanggal_wawancara: "",
  penilaian: buildDefaultPenilaian(),
  kesimpulan: "",
  gaji_harapan: "",
  nama_pewawancara: "",
};

const STAGE_NUMBER_TO_KEY = {
  1: "interview-pertama",
  2: "interview-kedua",
};

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${className}`}
  >
    {children}
  </div>
);

const CardHeader = ({ icon: Icon, iconColor, title, subtitle, badge }) => (
  <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-50">
    <div className="flex items-center gap-3">
      <span
        className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${iconColor.bg}`}
      >
        <Icon className={iconColor.text} size={18} />
      </span>
      <div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
    {badge && (
      <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full whitespace-nowrap">
        {badge}
      </span>
    )}
  </div>
);

const Field = ({ label, children, className = "" }) => (
  <div className={className}>
    <label className="block text-xs font-medium text-gray-500 mb-1.5">
      {label}
    </label>
    {children}
  </div>
);

const inputCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition";

const kesimpulanMeta = (opt = "") => {
  const lower = opt.toLowerCase();
  if (lower.includes("tidak")) {
    return {
      icon: XCircle,
      iconColor: "text-red-500",
      border: "border-red-500",
      bg: "bg-red-50/60",
      title: "text-red-600",
      desc: "Calon tidak sesuai dengan standar operasional departemen.",
    };
  }
  return {
    icon: CheckCircle2,
    iconColor: "text-green-600",
    border: "border-green-600",
    bg: "bg-green-50/60",
    title: "text-green-700",
    desc: "Calon memenuhi kualifikasi teknis dan budaya perusahaan.",
  };
};

const KesimpulanCard = ({ opt, active, onSelect }) => {
  const meta = kesimpulanMeta(opt);
  const Icon = meta.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(opt)}
      className={`flex-1 text-left border-2 rounded-xl p-4 transition ${
        active ? `${meta.border} ${meta.bg}` : "border-gray-200 hover:border-gray-300 bg-white"
      }`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className={meta.iconColor} size={20} />
        <span className={`text-sm font-bold ${active ? meta.title : "text-gray-700"}`}>
          {opt.toUpperCase()}
        </span>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">{meta.desc}</p>
    </button>
  );
};

/* =========================================================================
 * Tabel penilaian aspek (Kurang / Cukup / Baik) + kolom Keterangan,
 * mengikuti tabel utama pada formulir wawancara.
 * ========================================================================= */
const PenilaianTable = ({ rows, onRatingChange, onKeteranganChange }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
          <th className="px-3 py-2.5 text-left w-8 border-b border-gray-100">No</th>
          <th className="px-3 py-2.5 text-left border-b border-gray-100 w-40">Aspek</th>
          <th className="px-3 py-2.5 text-left border-b border-gray-100">Uraian</th>
          <th className="px-3 py-2.5 text-center border-b border-gray-100 w-56">
            Penilaian
          </th>
          <th className="px-3 py-2.5 text-left border-b border-gray-100 w-52">
            Keterangan
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={row.aspek} className="align-top border-b border-gray-50 last:border-b-0">
            <td className="px-3 py-3 text-gray-400">{idx + 1}</td>
            <td className="px-3 py-3 font-medium text-gray-800">{row.aspek}</td>
            <td className="px-3 py-3 text-gray-500 leading-relaxed">{row.uraian}</td>
            <td className="px-3 py-3">
              <div className="flex items-center justify-center gap-4">
                {RATING_OPTIONS.map((opt) => (
                  <label
                    key={opt}
                    className="flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={`penilaian-${idx}`}
                      checked={row.nilai === opt}
                      onChange={() => onRatingChange(idx, opt)}
                      className="w-4 h-4 accent-sky-600"
                    />
                    <span className="text-[11px] text-gray-500">{opt}</span>
                  </label>
                ))}
              </div>
            </td>
            <td className="px-3 py-3">
              <input
                type="text"
                value={row.keterangan}
                onChange={(e) => onKeteranganChange(idx, e.target.value)}
                placeholder="Keterangan..."
                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const InterviewForm = ({
  applicationId,
  stage = 1,
  initialData = null,
  onSuccess,
}) => {
  const [form, setForm] = useState({ ...initialForm, tahap: stage });
  const [candidatePengguna, setCandidatePengguna] = useState(null);
  const [candidateStageInfo, setCandidateStageInfo] = useState({
    tahap: "",
    status: "",
  });

  const {
    submitInterview,
    loadPrefillData,
    loadInterviewByApplication,
    loading,
    error,
    successMessage,
    clearMessages,
  } = usePenilaianStore();

  const stageLabel = INTERVIEW_STAGE_LABELS[stage] || "Interview";
  const stageFilterKey = STAGE_NUMBER_TO_KEY[stage] || null;

  const applyRecord = (record) => ({
    ...initialForm,
    ...record,
    tahap: stage,
    tanggal_wawancara: record.tanggal_wawancara
      ? new Date(record.tanggal_wawancara).toISOString().substring(0, 10)
      : "",
    tanggal_lahir: record.tanggal_lahir
      ? new Date(record.tanggal_lahir).toISOString().substring(0, 10)
      : "",
    penilaian: normalizePenilaian(record.penilaian),
  });

  const loadCandidateProfile = async (appId) => {
    if (!appId) return;
    const data = await loadPrefillData(appId);
    if (data) {
      setCandidatePengguna(data.pengguna || null);
      setCandidateStageInfo({ tahap: data.tahap || "", status: data.status || "" });
    }
  };

  useEffect(() => {
    if (initialData) {
      setForm(applyRecord(initialData));
      const appId = initialData.lamaran_id || applicationId;
      if (appId) loadCandidateProfile(appId);
      return;
    }

    if (applicationId) {
      setForm((prev) => ({ ...prev, lamaran_id: applicationId, tahap: stage }));
      loadCandidateProfile(applicationId);

      loadInterviewByApplication(applicationId, stage).then((existing) => {
        if (existing) {
          setForm(applyRecord(existing));
          return;
        }

        loadPrefillData(applicationId).then((data) => {
          if (data) {
            const latestPendidikan = data.pengguna?.pendidikan?.[0] || null;
            setForm((prev) => ({
              ...prev,
              lamaran_id: data.id,
              tahap: stage,
              nama_pelamar: data.pengguna?.nama || prev.nama_pelamar,
              jabatan_dilamar: data.lowongan?.judul || prev.jabatan_dilamar,
              tanggal_lahir: data.pengguna?.profil?.tanggal_lahir
                ? new Date(data.pengguna.profil.tanggal_lahir).toISOString().substring(0, 10)
                : prev.tanggal_lahir,
              pendidikan_terakhir: latestPendidikan?.gelar || prev.pendidikan_terakhir,
            }));
          }
        });
      });
    } else {
      setCandidatePengguna(null);
      setCandidateStageInfo({ tahap: "", status: "" });
    }
  }, [initialData, applicationId, stage]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCandidateSelect = async (candidate) => {
    clearMessages();
    setForm((prev) => ({
      ...prev,
      lamaran_id: candidate.id,
      nama_pelamar: candidate.pengguna?.nama || prev.nama_pelamar,
      jabatan_dilamar: candidate.lowongan?.judul || prev.jabatan_dilamar,
      tanggal_lahir: candidate.tanggal_lahir || prev.tanggal_lahir,
      pendidikan_terakhir: candidate.pendidikan_terakhir || prev.pendidikan_terakhir,
      penilaian: buildDefaultPenilaian(),
    }));

    setCandidatePengguna(candidate.pengguna || null);
    setCandidateStageInfo({
      tahap: candidate.tahap || "",
      status: candidate.status || "",
    });

    const existing = await loadInterviewByApplication(candidate.id, stage);
    if (existing) {
      setForm(applyRecord(existing));
    }
  };

  const handleRatingChange = (index, nilai) => {
    setForm((prev) => {
      const rows = [...prev.penilaian];
      rows[index] = { ...rows[index], nilai };
      return { ...prev, penilaian: rows };
    });
  };

  const handleKeteranganChange = (index, keterangan) => {
    setForm((prev) => {
      const rows = [...prev.penilaian];
      rows[index] = { ...rows[index], keterangan };
      return { ...prev, penilaian: rows };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      const targetId = form.id || initialData?.id || null;
      const result = await submitInterview(form, targetId);
      if (result?.id) {
        setForm((prev) => ({ ...prev, id: result.id }));
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      // error sudah ditangani di store
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto p-4 md:p-6 space-y-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-sky-900">
            Rangkuman Hasil Wawancara Calon Karyawan
          </h2>
        </div>
        <span className="shrink-0 text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full whitespace-nowrap">
          {stageLabel}
        </span>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-2.5 text-sm">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 text-green-700 border border-green-200 rounded-xl px-4 py-2.5 text-sm">
          {successMessage}
        </div>
      )}

      <Card>
        <CardHeader
          icon={User}
          iconColor={{ bg: "bg-blue-50", text: "text-blue-600" }}
          title="Data Calon"
          subtitle={`Hanya menampilkan kandidat pada tahap ${stageLabel}`}
          badge={candidateStageInfo.tahap || candidateStageInfo.status || undefined}
        />
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Field label="Nama Calon">
                <CandidateSearchInput
                  value={form.nama_pelamar}
                  onSelect={handleCandidateSelect}
                  onChangeText={(text) => handleChange("nama_pelamar", text)}
                  placeholder="Ketik nama calon untuk mencari..."
                  stage={stageFilterKey}
                  stageLabel={stageLabel}
                />
              </Field>
            </div>

            <Field label="Tanggal Wawancara">
              <input
                type="date"
                required
                value={form.tanggal_wawancara}
                onChange={(e) =>
                  handleChange("tanggal_wawancara", e.target.value)
                }
                className={inputCls}
              />
            </Field>

            <Field label="Jabatan yang Dilamar">
              <input
                type="text"
                value={form.jabatan_dilamar}
                onChange={(e) => handleChange("jabatan_dilamar", e.target.value)}
                className={inputCls}
                placeholder="Contoh: Accounting"
              />
            </Field>

            <Field label="Usia">
              <input
                type="number"
                min="0"
                value={form.usia}
                onChange={(e) => handleChange("usia", e.target.value)}
                className={inputCls}
                placeholder="Contoh: 25"
              />
            </Field>

            <Field label="Pendidikan Terakhir">
              <input
                type="text"
                value={form.pendidikan_terakhir}
                onChange={(e) =>
                  handleChange("pendidikan_terakhir", e.target.value)
                }
                className={inputCls}
                placeholder="Contoh: S1"
              />
            </Field>

            <Field label="Pengalaman Kerja / Bidang">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.pengalaman_kerja}
                  onChange={(e) =>
                    handleChange("pengalaman_kerja", e.target.value)
                  }
                  className={inputCls}
                  placeholder="Contoh: 3 Bulan"
                />
                <input
                  type="text"
                  value={form.bidang_pengalaman}
                  onChange={(e) =>
                    handleChange("bidang_pengalaman", e.target.value)
                  }
                  className={inputCls}
                  placeholder="Bidang: Finance"
                />
              </div>
            </Field>
        </div>
      </Card>

      <Card>
        <CardHeader
          icon={ClipboardList}
          iconColor={{ bg: "bg-sky-50", text: "text-sky-600" }}
          title="Penilaian Aspek Wawancara"
          subtitle="Beri nilai Kurang / Cukup / Baik untuk tiap aspek."
        />
        <div className="p-2 md:p-4">
          <PenilaianTable
            rows={form.penilaian}
            onRatingChange={handleRatingChange}
            onKeteranganChange={handleKeteranganChange}
          />
        </div>
      </Card>

      <Card>
        <CardHeader
          icon={Wallet}
          iconColor={{ bg: "bg-amber-50", text: "text-amber-600" }}
          title="Ekspektasi & Pewawancara"
        />
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Gaji Harapan (Expected Salary)">
            <input
              type="text"
              value={form.gaji_harapan}
              onChange={(e) => handleChange("gaji_harapan", e.target.value)}
              className={inputCls}
              placeholder="Contoh: 5.000.000"
            />
          </Field>
          <Field label="Nama Pewawancara">
            <div className="relative">
              <PenLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
              <input
                type="text"
                value={form.nama_pewawancara}
                onChange={(e) =>
                  handleChange("nama_pewawancara", e.target.value)
                }
                className={`${inputCls} pl-8`}
                placeholder="Nama pewawancara"
              />
            </div>
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader
          icon={CheckCircle2}
          iconColor={{ bg: "bg-green-50", text: "text-green-600" }}
          title="Kesimpulan"
          subtitle="Keputusan final berdasarkan evaluasi wawancara."
        />
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {KESIMPULAN_INTERVIEW_OPTIONS.map((opt) => (
              <KesimpulanCard
                key={opt}
                opt={opt}
                active={form.kesimpulan === opt}
                onSelect={(v) => handleChange("kesimpulan", v)}
              />
            ))}
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 transition"
        >
          {loading ? "Menyimpan..." : "Simpan Hasil Wawancara"}
        </button>
      </div>
    </form>
  );
};

export default InterviewForm;