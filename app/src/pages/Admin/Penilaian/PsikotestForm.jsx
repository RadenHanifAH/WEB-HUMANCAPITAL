/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
import {
  User,
  BadgeCheck,
  Save,
  CheckCircle2,
  XCircle,
  Brain,
  StickyNote,
  Stamp,
  Plus,
  Trash2,
} from "lucide-react";
import axiosInstance from "../../../api/axiosInstance";
import usePenilaianStore from "./store/usePenilaianStore";
import CandidateSearchInput from "./components/Candidatesearchinput";
import {
  KESIMPULAN_PSIKOTEST_OPTIONS,
  IQ_KETERANGAN_OPTIONS,
  BAIK_BURUK_OPTIONS,
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
  // ✅ NEW: keterangan per-aspek — sebelumnya hanya "Keterangan IQ" yang ada,
  // padahal pada dokumen form kertas kolom "Keterangan" berlaku untuk
  // semua aspek (Kepribadian, Stabilitas Emosi, Integritas juga).
  keterangan_kepribadian: "",
  stabilitas_emosi: "",
  keterangan_stabilitas_emosi: "",
  integritas: "",
  keterangan_integritas: "",
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

const Field = ({ label, children, className = "" }) => (
  <div className={className}>
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

/* =========================================================================
 * Checkbox-style radio (☐), dipakai untuk field Baik/Buruk
 * (Kepribadian, Stabilitas Emosi, Integritas).
 * ========================================================================= */
const SquareRadioOption = ({ label, active, tone, onSelect }) => (
  <label
    onClick={() => onSelect(label)}
    className="flex items-center gap-2.5 cursor-pointer select-none"
  >
    <span
      className={`shrink-0 rounded-[4px] border-2 flex items-center justify-center transition ${
        active ? `${tone.border} ${tone.bg}` : "border-gray-300 bg-white"
      }`}
      style={{ width: 18, height: 18 }}
    >
      {active && <CheckCircle2 size={12} className={tone.icon} strokeWidth={3} />}
    </span>
    <span className={`text-sm font-medium ${active ? tone.text : "text-gray-600"}`}>
      {label}
    </span>
  </label>
);

const baikBurukTone = (opt = "") => {
  const lower = opt.toLowerCase();
  if (lower === "buruk") {
    return { border: "border-red-500", bg: "bg-red-500", icon: "text-white", text: "text-red-600" };
  }
  return { border: "border-green-600", bg: "bg-green-600", icon: "text-white", text: "text-green-700" };
};

const BaikBurukRadioGroup = ({ value, onChange }) => (
  <div className="flex items-center gap-6">
    {BAIK_BURUK_OPTIONS.map((opt) => (
      <SquareRadioOption
        key={opt}
        label={opt}
        active={value === opt}
        tone={baikBurukTone(opt)}
        onSelect={onChange}
      />
    ))}
  </div>
);

// ✅ NEW: Field gabungan Aspek (Baik/Buruk) + Keterangan, dipakai untuk
// Kepribadian, Stabilitas Emosi, dan Integritas — supaya sejajar dengan
// kolom "Keterangan" pada dokumen form kertas.
const AspekWithKeteranganField = ({
  label,
  value,
  onChange,
  keterangan,
  onKeteranganChange,
}) => (
  <div className="space-y-2.5">
    <Field label={label}>
      <BaikBurukRadioGroup value={value} onChange={onChange} />
    </Field>
    <input
      type="text"
      value={keterangan}
      onChange={(e) => onKeteranganChange(e.target.value)}
      className={inputCls}
      placeholder="Keterangan (opsional)"
    />
  </div>
);

const PsikotestForm = ({ applicationId, initialData = null, onSuccess }) => {
  const [form, setForm] = useState(initialForm);
  const [candidateStageInfo, setCandidateStageInfo] = useState({
    tahap: "",
    status: "",
  });
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

      const appId = initialData.lamaran_id || applicationId;
      if (appId) {
        loadPrefillData(appId).then((data) => {
          if (data) {
            setCandidateStageInfo({ tahap: data.tahap || "", status: data.status || "" });
          }
        });
      }
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
          setCandidateStageInfo({ tahap: data.tahap || "", status: data.status || "" });
        }
      });
    } else {
      setCandidateStageInfo({ tahap: "", status: "" });
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

    setCandidateStageInfo({
      tahap: candidate.tahap || "",
      status: candidate.status || "",
    });

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

      <Card>
        <CardHeader
          icon={User}
          iconColor={{ bg: "bg-blue-50", text: "text-blue-600" }}
          title="Data Calon Karyawan"
          subtitle={`Hanya menampilkan kandidat pada tahap ${PSIKOTES_STAGE_LABEL}`}
          badge={candidateStageInfo.tahap || candidateStageInfo.status || undefined}
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

            <Field label="Posisi Dilamar">
              <input
                type="text"
                value={form.posisi}
                onChange={(e) => handleChange("posisi", e.target.value)}
                className={inputCls}
                placeholder="Contoh: Accounting"
              />
            </Field>

            <Field label="Tanggal Test">
              <input
                type="date"
                required
                value={form.tanggal_tes}
                onChange={(e) => handleChange("tanggal_tes", e.target.value)}
                className={inputCls}
              />
            </Field>

            <Field label="Tester">
              <input
                type="text"
                value={form.penguji}
                onChange={(e) => handleChange("penguji", e.target.value)}
                className={inputCls}
                placeholder="Nama penguji"
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

      <Card>
        <CardHeader
          icon={Brain}
          iconColor={{ bg: "bg-violet-50", text: "text-violet-600" }}
          title="Hasil Penilaian Psikotest"
          subtitle="Aspek, nilai, dan keterangan hasil test."
        />
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1.4fr] gap-4 items-end pb-5 border-b border-gray-50">
            <Field label="Kognitif / IQ (Angka 70-170)">
              <input
                type="number"
                min="70"
                max="170"
                value={form.skor_iq}
                onChange={(e) => handleChange("skor_iq", e.target.value)}
                className={inputCls}
                placeholder="Contoh: 110"
              />
            </Field>
            <Field label="Keterangan IQ">
              <select
                value={form.keterangan_iq}
                onChange={(e) => handleChange("keterangan_iq", e.target.value)}
                className={inputCls}
              >
                <option value="">Pilih keterangan</option>
                {IQ_KETERANGAN_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Field>
            <div />
          </div>

          {/* 🔧 FIX: setiap aspek (Kepribadian, Stabilitas Emosi, Integritas)
              sekarang punya field Keterangan sendiri, sejajar dengan kolom
              "Keterangan" pada dokumen form kertas — sebelumnya cuma IQ
              yang punya keterangan. */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-5 border-b border-gray-50">
            <AspekWithKeteranganField
              label="Kepribadian"
              value={form.kepribadian}
              onChange={(v) => handleChange("kepribadian", v)}
              keterangan={form.keterangan_kepribadian}
              onKeteranganChange={(v) => handleChange("keterangan_kepribadian", v)}
            />
            <AspekWithKeteranganField
              label="Stabilitas Emosi"
              value={form.stabilitas_emosi}
              onChange={(v) => handleChange("stabilitas_emosi", v)}
              keterangan={form.keterangan_stabilitas_emosi}
              onKeteranganChange={(v) => handleChange("keterangan_stabilitas_emosi", v)}
            />
            <AspekWithKeteranganField
              label="Integritas"
              value={form.integritas}
              onChange={(v) => handleChange("integritas", v)}
              keterangan={form.keterangan_integritas}
              onKeteranganChange={(v) => handleChange("keterangan_integritas", v)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-500">Aspek Tambahan (opsional)</p>
              <button
                type="button"
                onClick={addExtraRow}
                className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-700"
              >
                <Plus size={14} /> Tambah Aspek
              </button>
            </div>
            <div className="space-y-2">
              {form.aspek_tambahan.map((row, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1.4fr_auto] gap-2">
                  <input
                    type="text"
                    value={row.aspek}
                    onChange={(e) => handleExtraRowChange(idx, "aspek", e.target.value)}
                    className={inputCls}
                    placeholder="Aspek"
                  />
                  <input
                    type="text"
                    value={row.nilai}
                    onChange={(e) => handleExtraRowChange(idx, "nilai", e.target.value)}
                    className={inputCls}
                    placeholder="Nilai"
                  />
                  <input
                    type="text"
                    value={row.keterangan}
                    onChange={(e) => handleExtraRowChange(idx, "keterangan", e.target.value)}
                    className={inputCls}
                    placeholder="Keterangan"
                  />
                  {form.aspek_tambahan.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExtraRow(idx)}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 self-center"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          icon={StickyNote}
          iconColor={{ bg: "bg-slate-50", text: "text-slate-600" }}
          title="Catatan"
        />
        <div className="p-6">
          <textarea
            value={form.catatan}
            onChange={(e) => handleChange("catatan", e.target.value)}
            rows={3}
            className={`${inputCls} resize-none`}
            placeholder="Catatan tambahan mengenai hasil psikotest..."
          />
        </div>
      </Card>

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

      <Card>
        <CardHeader
          icon={Stamp}
          iconColor={{ bg: "bg-teal-50", text: "text-teal-600" }}
          title="Pemeriksa"
          subtitle="Nama penanggung jawab pemeriksaan hasil."
        />
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Staff Human Capital">
            <input
              type="text"
              value={form.nama_pemeriksa_staff}
              onChange={(e) => handleChange("nama_pemeriksa_staff", e.target.value)}
              className={inputCls}
              placeholder="Nama staff"
            />
          </Field>
          <Field label="Human Capital Manager">
            <input
              type="text"
              value={form.nama_pemeriksa_manager}
              onChange={(e) => handleChange("nama_pemeriksa_manager", e.target.value)}
              className={inputCls}
              placeholder="Nama manager"
            />
          </Field>
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