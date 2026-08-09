/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  User,
  CheckCircle2,
  XCircle,
  UploadCloud,
  FileText,
  X,
} from "lucide-react";
import usePenilaianStore from "./store/usePenilaianStore";
import CandidateSearchInput from "./components/Candidatesearchinput";
import {
  KESIMPULAN_INTERVIEW_OPTIONS,
  INTERVIEW_STAGE_LABELS,
} from "./utils/constants";

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
  penilaian: [],
  kesimpulan: "",
  gaji_harapan: "",
  nama_pewawancara: "",
  tanda_tangan_pewawancara: "",
  data_dokumen_pendukung: "",
  nama_dokumen_pendukung: "",
  mime_dokumen_pendukung: "",
  ukuran_dokumen_pendukung: null,
};

const STAGE_NUMBER_TO_KEY = {
  1: "interview-pertama",
  2: "interview-kedua",
};

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; 
const ACCEPTED_UPLOAD_TYPES = ["application/pdf", "image/png", "image/jpeg"];
const ACCEPTED_UPLOAD_ACCEPT = "application/pdf,image/png,image/jpeg";

const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

const hasValue = (v) => String(v ?? "").trim().length > 0;

const ProfileField = ({ label, value, icon: Icon }) => (
  <div className="min-w-0">
    <p className="text-[11px] text-gray-400 mb-0.5">{label}</p>
    <div className="flex items-start gap-1.5 text-gray-800 min-w-0">
      {Icon && <Icon className="h-3.5 w-3.5 text-sky-500 mt-0.5 shrink-0" />}
      <span className="text-sm font-medium leading-snug break-words">
        {hasValue(value) ? value : "-"}
      </span>
    </div>
  </div>
);

const CandidateProfileCard = ({ pengguna, tahap, status }) => {
  if (!pengguna) return null;
  const profil = pengguna.profil || null;

  const tanggalLahirText = profil?.tanggal_lahir
    ? new Date(profil.tanggal_lahir).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

  return (
    <Card>
      <CardHeader
        icon={User}
        iconColor={{ bg: "bg-emerald-50", text: "text-emerald-600" }}
        title="Profil Kandidat"
        subtitle="Data diambil dari profil & lamaran kandidat"
        badge={tahap || status || undefined}
      />
      <div className="p-6">
        <div className="flex items-center gap-3 mb-5">
          {profil?.foto_profil ? (
            <img
              src={profil.foto_profil}
              alt="Foto Profil"
              className="w-12 h-12 rounded-full object-cover border-2 border-sky-100"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center border-2 border-sky-100">
              <User className="h-6 w-6 text-gray-400" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">
              {pengguna.nama || "-"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {pengguna.email || "-"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <ProfileField label="NIK" value={profil?.nik} />
          <ProfileField label="Jenis Kelamin" value={profil?.jenis_kelamin} />
          <ProfileField label="No. HP" value={profil?.nomor_hp} />
          <ProfileField label="Tempat Lahir" value={profil?.tempat_lahir} />
          <ProfileField label="Tanggal Lahir" value={tanggalLahirText} />
          <ProfileField label="Alamat" value={profil?.alamat} />
        </div>
      </div>
    </Card>
  );
};

const UploadDokumenCard = ({
  fileName,
  fileSize,
  onSelectFile,
  onRemoveFile,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const validateAndSelect = (file) => {
    if (!file) return;
    setUploadError("");

    if (!ACCEPTED_UPLOAD_TYPES.includes(file.type)) {
      setUploadError("Format file tidak didukung. Gunakan PDF, PNG, atau JPG.");
      return;
    }
    if (file.size > MAX_UPLOAD_SIZE) {
      setUploadError("Ukuran file maksimal 10MB.");
      return;
    }
    onSelectFile(file);
  };

  const handleInputChange = (e) => {
    validateAndSelect(e.target.files?.[0]);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    validateAndSelect(e.dataTransfer.files?.[0]);
  };

  return (
    <Card>
      <CardHeader
        icon={UploadCloud}
        iconColor={{ bg: "bg-orange-50", text: "text-orange-600" }}
        title="Unggah Dokumen"
        subtitle="Hasil karya atau portofolio kandidat."
      />
      <div className="p-6">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-10 px-4 text-center transition ${
            dragActive
              ? "border-blue-400 bg-blue-50/50"
              : "border-gray-200 bg-gray-50/40"
          }`}
        >
          <span className="w-11 h-11 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400">
            <UploadCloud size={20} />
          </span>
          <p className="text-sm font-medium text-gray-700 mt-1">
            Pilih file atau tarik kesini
          </p>
          <p className="text-xs text-gray-400">PDF, PNG, JPG up to 10MB</p>
          <label className="mt-3 inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer transition">
            Pilih File
            <input
              type="file"
              accept={ACCEPTED_UPLOAD_ACCEPT}
              onChange={handleInputChange}
              className="hidden"
            />
          </label>
        </div>

        {uploadError && (
          <p className="text-xs text-red-500 mt-2">{uploadError}</p>
        )}

        {fileName && (
          <div className="mt-4 flex items-center gap-3 border border-gray-100 rounded-lg px-3 py-2.5">
            <span className="w-9 h-9 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
              <FileText size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-800 truncate">
                {fileName}
              </p>
              <p className="text-xs text-gray-400">{formatFileSize(fileSize)}</p>
            </div>
            <button
              type="button"
              onClick={onRemoveFile}
              className="text-gray-300 hover:text-red-500 transition shrink-0"
              title="Hapus dokumen"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};

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
    penilaian: Array.isArray(record.penilaian) ? record.penilaian : [],
    data_dokumen_pendukung: record.data_dokumen_pendukung || "",
    nama_dokumen_pendukung: record.nama_dokumen_pendukung || "",
    mime_dokumen_pendukung: record.mime_dokumen_pendukung || "",
    ukuran_dokumen_pendukung: record.ukuran_dokumen_pendukung ?? null,
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
      data_dokumen_pendukung: "",
      nama_dokumen_pendukung: "",
      mime_dokumen_pendukung: "",
      ukuran_dokumen_pendukung: null,
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

  const handleSelectDokumen = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        data_dokumen_pendukung: reader.result,
        nama_dokumen_pendukung: file.name,
        mime_dokumen_pendukung: file.type,
        ukuran_dokumen_pendukung: file.size,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveDokumen = () => {
    setForm((prev) => ({
      ...prev,
      data_dokumen_pendukung: "",
      nama_dokumen_pendukung: "",
      mime_dokumen_pendukung: "",
      ukuran_dokumen_pendukung: null,
    }));
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

      {candidatePengguna && (
        <CandidateProfileCard
          pengguna={candidatePengguna}
          tahap={candidateStageInfo.tahap}
          status={candidateStageInfo.status}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
        <Card>
          <CardHeader
            icon={User}
            iconColor={{ bg: "bg-blue-50", text: "text-blue-600" }}
            title="Data Calon"
            subtitle={`Hanya menampilkan kandidat pada tahap ${stageLabel}`}
          />
          <div className="p-6 grid grid-cols-1 gap-4">
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
          </div>
        </Card>

        <UploadDokumenCard
          fileName={form.nama_dokumen_pendukung}
          fileSize={form.ukuran_dokumen_pendukung}
          onSelectFile={handleSelectDokumen}
          onRemoveFile={handleRemoveDokumen}
        />
      </div>

      <Card>
        <CardHeader
          icon={CheckCircle2}
          iconColor={{ bg: "bg-green-50", text: "text-green-600" }}
          title="Kesimpulan Akhir"
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