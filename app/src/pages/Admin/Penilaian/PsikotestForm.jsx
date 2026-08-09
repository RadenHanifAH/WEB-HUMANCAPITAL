/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  User,
  BadgeCheck,
  Save,
  Upload,
  FileText,
  X as XIcon,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import axiosInstance from "../../../api/axiosInstance"; 
import usePenilaianStore from "./store/usePenilaianStore";
import CandidateSearchInput from "./components/Candidatesearchinput";
import {
  KESIMPULAN_PSIKOTEST_OPTIONS,
} from "./utils/constants";

const emptyExtraRow = () => ({ aspek: "", nilai: "", keterangan: "" });

const initialForm = {
  id: null,
  lamaran_id: "",
  nama_pelamar: "",
  posisi: "",
  tanggal_tes: "",
  penguji: "",
  skor_iq: "",
  keterangan_iq: "",
  kepribadian: "",
  stabilitas_emosi: "",
  integritas: "",
  aspek_tambahan: [emptyExtraRow()],
  kesimpulan: "",
  skor_akhir: "",
  catatan: "",
  nama_pemeriksa_staff: "",
  nama_pemeriksa_manager: "",
  data_dokumen_pendukung: "",
  nama_dokumen_pendukung: "",
  mime_dokumen_pendukung: "",
  ukuran_dokumen_pendukung: null,
};

const PSIKOTES_STAGE_KEY = "psikotes";
const PSIKOTES_STAGE_LABEL = "Psikotes";

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ icon: Icon, iconColor, title, subtitle, badge }) => (
  <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-50">
    <div className="flex items-center gap-3">
      <span className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${iconColor.bg}`}>
        <Icon className={`w-4.5 h-4.5 ${iconColor.text}`} size={18} />
      </span>
      <div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {badge && (
      <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full whitespace-nowrap">
        {badge}
      </span>
    )}
  </div>
);

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
    {children}
  </div>
);

const inputCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition";

const kesimpulanMeta = (opt = "") => {
  const lower = opt.toLowerCase();
  if (lower === "tidak direkomendasikan") {
    return {
      icon: XCircle,
      iconColor: "text-red-500",
      border: "border-red-500",
      bg: "bg-red-50/60",
      title: "text-red-600",
      desc: "Calon tidak memenuhi standar psikologis yang dibutuhkan untuk posisi ini.",
    };
  }
  return {
    icon: CheckCircle2,
    iconColor: "text-green-600",
    border: "border-green-600",
    bg: "bg-green-50/60",
    title: "text-green-700",
    desc: "Calon memenuhi kualifikasi psikologis untuk posisi yang dilamar.",
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

const MAX_FILE_SIZE = 10 * 1024 * 1024; 
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "application/pdf"];

const DocumentUpload = ({ fileName, fileData, onUpload, onRemove, error }) => {
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    const file = files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      onUpload(null, "Format file harus PNG, JPG, atau PDF.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      onUpload(null, "Ukuran file maksimal 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onUpload({ dataUrl: reader.result, name: file.name, mime: file.type, size: file.size });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <Card>
      <CardHeader
        icon={Upload}
        iconColor={{ bg: "bg-orange-50", text: "text-orange-600" }}
        title="Unggah Dokumen"
        subtitle="Hasil test atau lembar jawaban."
      />
      <div className="p-6 space-y-3">
        {!fileData ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-200 rounded-xl py-10 px-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-sky-300 hover:bg-sky-50/30 transition"
          >
            <span className="w-11 h-11 rounded-lg bg-gray-50 flex items-center justify-center mb-3">
              <FileText className="text-gray-400" size={22} />
            </span>
            <p className="text-sm font-medium text-gray-700">Pilih file atau tarik kesini</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF up to 10MB</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="mt-4 px-4 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-medium hover:bg-sky-700"
            >
              Pilih File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>
        ) : (
          <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3">
            <span className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
              <FileText className="text-sky-600" size={18} />
            </span>
            <span className="text-sm text-gray-700 truncate flex-1">{fileName}</span>
            <button
              type="button"
              onClick={onRemove}
              className="p-1 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 shrink-0"
            >
              <XIcon size={16} />
            </button>
          </div>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </Card>
  );
};

const PsikotestForm = ({ applicationId, initialData = null, onSuccess }) => {
  const [form, setForm] = useState(initialForm);
  const [fileError, setFileError] = useState("");
  const {
    submitPsikotest,
    loadPrefillData,
    loading,
    error,
    successMessage,
    clearMessages,
  } = usePenilaianStore();

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialForm,
        ...initialData,
        tanggal_tes: initialData.tanggal_tes ? initialData.tanggal_tes.substring(0, 10) : "",
        aspek_tambahan:
          initialData.aspek_tambahan?.length > 0 ? initialData.aspek_tambahan : [emptyExtraRow()],
        data_dokumen_pendukung: initialData.data_dokumen_pendukung || "",
        nama_dokumen_pendukung: initialData.nama_dokumen_pendukung || "",
        mime_dokumen_pendukung: initialData.mime_dokumen_pendukung || "",
        ukuran_dokumen_pendukung: initialData.ukuran_dokumen_pendukung || null,
      });
      return;
    }

    if (applicationId) {
      setForm((prev) => ({ ...prev, lamaran_id: applicationId }));
      loadPrefillData(applicationId).then((data) => {
        if (data) {
          setForm((prev) => ({
            ...prev,
            lamaran_id: data.id,
            nama_pelamar: data.pengguna?.nama || prev.nama_pelamar,
            posisi: data.lowongan?.judul || prev.posisi,
          }));
        }
      });
    }
  }, [initialData, applicationId]); 

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCandidateSelect = async (candidate) => {
    clearMessages();
    setForm((prev) => ({
      ...prev,
      lamaran_id: candidate.applicationId,
      nama_pelamar: candidate.applicantName,
      posisi: candidate.position,
    }));

    try {
      const res = await axiosInstance.get(
        `/penilaian/psikotest/by-application/${candidate.applicationId}`,
      );
      const existing = res?.data?.item;
      if (existing) {
        setForm((prev) => ({
          ...prev,
          ...existing,
          lamaran_id: candidate.applicationId,
          tanggal_tes: existing.tanggal_tes ? existing.tanggal_tes.substring(0, 10) : "",
          aspek_tambahan:
            existing.aspek_tambahan?.length > 0 ? existing.aspek_tambahan : [emptyExtraRow()],
          data_dokumen_pendukung: existing.data_dokumen_pendukung || "",
          nama_dokumen_pendukung: existing.nama_dokumen_pendukung || "",
          mime_dokumen_pendukung: existing.mime_dokumen_pendukung || "",
          ukuran_dokumen_pendukung: existing.ukuran_dokumen_pendukung || null,
        }));
      }
    } catch (err) {
      // Belum ada hasil psikotest sebelumnya -> biarkan form mode create
    }
  };

  const handleExtraRowChange = (index, field, value) => {
    setForm((prev) => {
      const rows = [...prev.aspek_tambahan];
      rows[index] = { ...rows[index], [field]: value };
      return { ...prev, aspek_tambahan: rows };
    });
  };

  const addExtraRow = () => {
    setForm((prev) => ({ ...prev, aspek_tambahan: [...prev.aspek_tambahan, emptyExtraRow()] }));
  };

  const removeExtraRow = (index) => {
    setForm((prev) => ({
      ...prev,
      aspek_tambahan: prev.aspek_tambahan.filter((_, i) => i !== index),
    }));
  };

  const handleDocumentUpload = (result, errMsg) => {
    if (errMsg) {
      setFileError(errMsg);
      return;
    }
    setFileError("");
    setForm((prev) => ({
      ...prev,
      data_dokumen_pendukung: result.dataUrl,
      nama_dokumen_pendukung: result.name,
      mime_dokumen_pendukung: result.mime,
      ukuran_dokumen_pendukung: result.size,
    }));
  };

  const handleDocumentRemove = () => {
    setFileError("");
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
      const payload = {
        ...form,
        aspek_tambahan: form.aspek_tambahan.filter((r) => r.aspek || r.nilai || r.keterangan),
      };
      await submitPsikotest(payload, initialData?.id || form.id || null);
      if (onSuccess) onSuccess();
    } catch (err) {
      // error sudah ditangani di store
    }
  };

  const completion = useMemo(() => {
    const required = [
      form.nama_pelamar,
      form.posisi,
      form.tanggal_tes,
      form.penguji,
      form.skor_iq,
      form.kepribadian,
      form.stabilitas_emosi,
      form.integritas,
      form.kesimpulan,
      form.skor_akhir,
    ];
    const filled = required.filter((v) => v !== "" && v !== null && v !== undefined).length;
    return Math.round((filled / required.length) * 100);
  }, [form]);

  const statusLabel = form.kesimpulan
    ? KESIMPULAN_PSIKOTEST_OPTIONS.find((o) => o === form.kesimpulan) || form.kesimpulan
    : "Proses Evaluasi";

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-sky-900">
          Form Hasil Keputusan Psikotest Calon Karyawan
        </h2>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            icon={User}
            iconColor={{ bg: "bg-blue-50", text: "text-blue-600" }}
            title="Data Calon Karyawan"
            subtitle={`Hanya menampilkan kandidat pada tahap ${PSIKOTES_STAGE_LABEL}`}
          />
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Field label="Nama Kandidat">
                <CandidateSearchInput
                  value={form.nama_pelamar}
                  onSelect={handleCandidateSelect}
                  onChangeText={(text) => handleChange("nama_pelamar", text)}
                  placeholder="Ketik nama kandidat untuk mencari..."
                  stage={PSIKOTES_STAGE_KEY}
                  stageLabel={PSIKOTES_STAGE_LABEL}
                />
              </Field>
            </div>

            <Field label="Tanggal Test">
              <input
                type="date"
                required
                value={form.tanggal_tes}
                onChange={(e) => handleChange("tanggal_tes", e.target.value)}
                className={inputCls}
              />
            </Field>

            <Field label="Skor Akhir (1-100)">
              <input
                type="number"
                min="1"
                max="100"
                required
                value={form.skor_akhir}
                onChange={(e) => handleChange("skor_akhir", e.target.value)}
                className={inputCls}
                placeholder="Contoh: 85"
              />
            </Field>
          </div>
        </Card>

        <DocumentUpload
          fileName={form.nama_dokumen_pendukung}
          fileData={form.data_dokumen_pendukung}
          onUpload={handleDocumentUpload}
          onRemove={handleDocumentRemove}
          error={fileError}
        />
      </div>

      <Card>
        <CardHeader
          icon={BadgeCheck}
          iconColor={{ bg: "bg-indigo-50", text: "text-indigo-600" }}
          title="Kesimpulan Test"
        />
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {KESIMPULAN_PSIKOTEST_OPTIONS.map((opt) => (
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

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 transition"
        >
          <Save size={16} />
          {loading ? "Menyimpan..." : "Simpan Hasil Penilaian"}
        </button>
      </div>
    </form>
  );
};

export default PsikotestForm;