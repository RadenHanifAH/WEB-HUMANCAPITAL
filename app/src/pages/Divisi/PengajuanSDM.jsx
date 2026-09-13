import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Users,
  ShieldCheck,
  Briefcase,
  LayoutGrid,
  Plus,
  X,
  Send,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "../../api/axiosInstance";
import useAuthStore from "../../store/useAuthStore";

// ===== Opsi-opsi ini disamakan persis dengan Form HC-01 kertas =====
const STATUS_KARYAWAN_OPTIONS = ["Tetap", "Kontrak", "Harian Lepas", "Freelance"];
const PENDIDIKAN_OPTIONS = ["SMU", "D1", "D3", "S1", "S2", "S3"];
const KEMAMPUAN_BAHASA_OPTIONS = ["Kurang", "cukup", "baik", "ahli"];
const LOKASI_OPTIONS = ["Bandung", "Surabaya", "Jakarta"];
const KOMPUTER_OPTIONS = ["Ms. Office", "Corel", "Adobe", "Hardware", "LAN"];
const STATUS_PERKAWINAN_OPTIONS = ["Kawin", "Blm Kawin"];

const JOBDESC_DEFAULT_COUNT = 3; // tampil 3 dulu, bisa ditambah
const KEAHLIAN_COUNT = 3; // sesuai form kertas: 1-3
const FASILITAS_COUNT = 6; // sesuai form kertas: 1-6

const PETA_LEVEL_DEFAULT = [
  { level: "Operator", requirement: "", existing: "" },
  { level: "Supervisor/Staf", requirement: "", existing: "" },
  { level: "Section Chief", requirement: "", existing: "" },
  { level: "Manajer", requirement: "", existing: "" },
];

// ✅ Logika Balance: Requirement - Existing
// req 5, existing 3 -> 2 -> "Kurang 2" (Merah)
// req 3, existing 5 -> -2 -> "Lebih 2" (Hijau)
function getBalanceInfo(requirement, existing) {
  const req = Number(requirement);
  const exi = Number(existing);

  if (requirement === "" || requirement == null || existing === "" || existing == null) {
    return { text: "-", className: "text-gray-400" };
  }
  if (Number.isNaN(req) || Number.isNaN(exi)) {
    return { text: "-", className: "text-gray-400" };
  }

  const diff = req - exi;
  if (diff > 0) return { text: `Kurang ${diff}`, className: "text-red-600 font-medium" };
  if (diff < 0) return { text: `Lebih ${Math.abs(diff)}`, className: "text-emerald-600 font-medium" };
  return { text: "Pas", className: "text-gray-500 font-medium" };
}

function getTodayDateInputValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

export default function PengajuanSDM() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);

  // ===== 1. Informasi Dasar Permintaan =====
  const [departemen, setDepartemen] = useState("");
  const [deptLocked, setDeptLocked] = useState(false);
  const [tanggalPermintaan, setTanggalPermintaan] = useState(getTodayDateInputValue());
  const [posisi, setPosisi] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [alasan, setAlasan] = useState("");

  // ===== 2. Spesifikasi Kebutuhan =====
  const [jumlah, setJumlah] = useState(1);
  const [jenisKelamin, setJenisKelamin] = useState("");
  const [levelPangkat, setLevelPangkat] = useState(""); // diisi oleh HCM
  const [rentangGaji, setRentangGaji] = useState(""); // diisi oleh HCM
  const [tglTerpenuhi, setTglTerpenuhi] = useState("");

  const [statusKaryawan, setStatusKaryawan] = useState("");
  const [statusKaryawanBulan, setStatusKaryawanBulan] = useState(""); // untuk Kontrak / Harian Lepas

  const [tugasUtama, setTugasUtama] = useState(Array(JOBDESC_DEFAULT_COUNT).fill(""));

  // ===== 3. Kualifikasi =====
  const [usiaMin, setUsiaMin] = useState("");
  const [usiaMaks, setUsiaMaks] = useState("");
  const [statusPerkawinan, setStatusPerkawinan] = useState([]); // multi-select (checkbox)
  const [pendidikanTerakhir, setPendidikanTerakhir] = useState(["S1"]); // multi-select, minimal 1
  const [jurusan, setJurusan] = useState("");
  const [keahlian, setKeahlian] = useState(Array(KEAHLIAN_COUNT).fill(""));
  const [pengalaman, setPengalaman] = useState("");
  const [syaratLain, setSyaratLain] = useState("");

  // ===== 4. Fasilitas & Pendukung =====
  const [bahasaAsing, setBahasaAsing] = useState("");
  const [kemampuanBahasaAsing, setKemampuanBahasaAsing] = useState(["ahli"]); // multi-select, minimal 1
  const [komputerSkills, setKomputerSkills] = useState([]); // gabungan opsi bawaan + custom
  const [skillInput, setSkillInput] = useState("");
  const [fasilitas, setFasilitas] = useState(Array(FASILITAS_COUNT).fill(""));

  // ===== 5. Peta Kekuatan Karyawan =====
  const [petaKekuatan, setPetaKekuatan] = useState(PETA_LEVEL_DEFAULT);

  useEffect(() => {
    if (!user) return;
    const autoDept = user.divisi || "";
    if (autoDept) {
      setDepartemen(autoDept);
      setDeptLocked(true);
    }
  }, [user]);

  const togglePendidikan = (value) => {
    setPendidikanTerakhir((prev) => {
      if (prev.includes(value)) {
        // Jangan biarkan kosong, minimal 1 harus tetap terpilih
        if (prev.length === 1) return prev;
        return prev.filter((v) => v !== value);
      }
      return [...prev, value];
    });
  };

  const toggleKemampuanBahasa = (value) => {
    setKemampuanBahasaAsing((prev) => {
      if (prev.includes(value)) {
        if (prev.length === 1) return prev;
        return prev.filter((v) => v !== value);
      }
      return [...prev, value];
    });
  };

  // ✅ Toggle Status Perkawinan (checkbox, boleh lebih dari satu / kosong)
  const toggleStatusPerkawinan = (value) => {
    setStatusPerkawinan((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  // ✅ Toggle opsi Komputer bawaan (Ms. Office/Corel/Adobe/Hardware/LAN)
  const toggleKomputerSkill = (value) => {
    setKomputerSkills((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const updateListItem = (list, setList, index, value) => {
    const next = [...list];
    next[index] = value;
    setList(next);
  };

  const addListItem = (list, setList, placeholder = "") => {
    setList([...list, placeholder]);
  };

  const removeListItem = (list, setList, index) => {
    setList(list.filter((_, i) => i !== index));
  };

  const handleAddSkillTag = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      const value = skillInput.trim();
      setKomputerSkills((prev) => (prev.includes(value) ? prev : [...prev, value]));
      setSkillInput("");
    }
  };

  const removeSkillTag = (value) => {
    setKomputerSkills((prev) => prev.filter((v) => v !== value));
  };

  const updatePeta = (index, field, value) => {
    setPetaKekuatan((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const buildPayload = () => ({
    departemen,
    tanggal_permintaan: tanggalPermintaan || undefined,
    posisi,
    lokasi,
    alasan: alasan || null,

    jumlah: Number(jumlah) || 1,
    jenis_kelamin: jenisKelamin || null,
    level_pangkat: levelPangkat || null,
    rentang_gaji: rentangGaji || null,
    tgl_terpenuhi: tglTerpenuhi || null,

    status_karyawan: statusKaryawan,
    status_karyawan_keterangan: statusKaryawanBulan || null,

    tugas_utama: tugasUtama.filter((t) => t.trim() !== ""),

    usia_min: usiaMin ? Number(usiaMin) : null,
    usia_maks: usiaMaks ? Number(usiaMaks) : null,
    status_perkawinan: statusPerkawinan, // array, bisa lebih dari satu
    pendidikan_terakhir: pendidikanTerakhir, // array, minimal 1 item
    jurusan: jurusan || null,
    keahlian: keahlian.filter((k) => k.trim() !== ""),
    pengalaman: pengalaman || null,
    syarat_lain: syaratLain || null,

    bahasa_asing: bahasaAsing,
    kemampuan_bahasa_asing: kemampuanBahasaAsing, // array, minimal 1 item
    keahlian_komputer: komputerSkills,
    fasilitas: fasilitas.filter((f) => f.trim() !== ""),

    peta_kekuatan: petaKekuatan.map((p) => ({
      level: p.level,
      requirement: p.requirement,
      existing: p.existing,
    })),
  });

  const handleSubmit = async () => {
    if (!departemen || !posisi || !lokasi) {
      toast.error("Departemen, Posisi, dan Lokasi wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildPayload();
      const { data: createRes } = await axios.post("/divisi/pengajuan", payload);
      const newId = createRes?.data?.id;

      if (newId) {
        await axios.post(`/divisi/pengajuan/${newId}/submit`);
      }

      toast.success("Pengajuan berhasil dikirim.");
      navigate("/divisi/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal mengirim pengajuan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kebutuhan Sumber Daya Manusia</h1>
      </div>

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        {/* ===== 1. Informasi Dasar Permintaan ===== */}
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-5">
            <FileText className="w-[18px] h-[18px] text-blue-600" />
            Informasi Dasar Permintaan
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Dept / Divisi</label>
              <input
                type="text"
                value={departemen}
                onChange={(e) => setDepartemen(e.target.value)}
                readOnly={deptLocked}
                disabled={deptLocked}
                placeholder="Contoh: IT, Marketing, Finance"
                className={`w-full px-3 py-2.5 rounded-lg border text-sm placeholder:text-gray-400 focus:outline-none ${
                  deptLocked
                    ? "border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                    : "border-gray-200 text-gray-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                }`}
              />
              {deptLocked && (
                <p className="text-xs text-gray-400 mt-1">Otomatis terisi sesuai akun divisi Anda.</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Tanggal Permintaan</label>
              <input
                type="date"
                value={tanggalPermintaan}
                onChange={(e) => setTanggalPermintaan(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Posisi Pekerjaan / Jabatan</label>
              <input
                type="text"
                value={posisi}
                onChange={(e) => setPosisi(e.target.value)}
                placeholder="Contoh: Senior Graphic Designer"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Lokasi Penempatan</label>
              <select
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              >
                <option value="">Pilih Lokasi</option>
                {LOKASI_OPTIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1.5">Alasan Permintaan SDM</label>
              <textarea
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                placeholder="Jelaskan urgensi dan alasan penambahan personil..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>
          </div>
        </section>

        {/* ===== 2. Spesifikasi Kebutuhan ===== */}
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-5">
            <Users className="w-[18px] h-[18px] text-blue-600" />
            Spesifikasi Kebutuhan
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Jumlah (Orang)</label>
                  <input
                    type="number"
                    min={1}
                    value={jumlah}
                    onChange={(e) => setJumlah(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Jenis Kelamin</label>
                  <select
                    value={jenisKelamin}
                    onChange={(e) => setJenisKelamin(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  >
                    <option value="">Bebas</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">
                    Level / Pangkat
                    <span className="text-gray-400 italic"> (diisi HCM)</span>
                  </label>
                  <input
                    type="text"
                    value={levelPangkat}
                    onChange={(e) => setLevelPangkat(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">
                    Rentang Gaji
                    <span className="text-gray-400 italic"> (diisi HCM)</span>
                  </label>
                  <input
                    type="text"
                    value={rentangGaji}
                    onChange={(e) => setRentangGaji(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Tgl Terpenuhi</label>
                <input
                  type="date"
                  value={tglTerpenuhi}
                  onChange={(e) => setTglTerpenuhi(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Status Karyawan</label>
                <div className="space-y-2">
                  {STATUS_KARYAWAN_OPTIONS.map((opt) => {
                    const needsDuration = opt === "Kontrak" || opt === "Harian Lepas";
                    const isChecked = statusKaryawan === opt;
                    return (
                      <label
                        key={opt}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm text-gray-600 cursor-pointer hover:border-blue-300 ${
                          isChecked ? "border-blue-300 bg-blue-50/40" : "border-gray-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name="statusKaryawan"
                          checked={isChecked}
                          onChange={() => setStatusKaryawan(opt)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-400 shrink-0"
                        />
                        <span className="shrink-0">{opt}</span>
                        {needsDuration && (
                          <span
                            className="flex items-center gap-1.5 ml-auto"
                            onClick={(e) => e.preventDefault()}
                          >
                            <input
                              type="text"
                              value={isChecked ? statusKaryawanBulan : ""}
                              onChange={(e) => setStatusKaryawanBulan(e.target.value)}
                              onFocus={() => setStatusKaryawan(opt)}
                              placeholder="...."
                              className="w-14 px-2 py-1 rounded-md border border-gray-200 bg-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                            />
                            <span className="text-gray-400">Bulan</span>
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm text-gray-600 mb-2">
                Tugas &amp; Tanggung Jawab Utama (Job Desc)
              </label>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                {tugasUtama.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-5 shrink-0 text-sm text-gray-400">{idx + 1}.</span>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateListItem(tugasUtama, setTugasUtama, idx, e.target.value)}
                      placeholder="Tanggung jawab..."
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                    />
                    {tugasUtama.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeListItem(tugasUtama, setTugasUtama, idx)}
                        className="text-gray-300 hover:text-red-500 shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addListItem(tugasUtama, setTugasUtama)}
                  className="flex items-center gap-1.5 text-sm text-blue-600 font-medium pt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah poin lainnya
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ===== 3. Kualifikasi (Standard) ===== */}
        <section className="bg-gray-50/60 rounded-xl border border-gray-100 p-6 space-y-5">
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <ShieldCheck className="w-[18px] h-[18px] text-emerald-600" />
            Kualifikasi (Standard)
          </h2>

          <div className="bg-white rounded-lg border border-gray-100 p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Usia (Rentang)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={usiaMin}
                  onChange={(e) => setUsiaMin(e.target.value)}
                  placeholder="Min"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                />
                <span className="text-gray-300">-</span>
                <input
                  type="number"
                  value={usiaMaks}
                  onChange={(e) => setUsiaMaks(e.target.value)}
                  placeholder="Max"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Status Perkawinan</label>
              <div className="flex items-center gap-4 h-[42px]">
                {STATUS_PERKAWINAN_OPTIONS.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={statusPerkawinan.includes(opt)}
                      onChange={() => toggleStatusPerkawinan(opt)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-400"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Pendidikan</label>
              <div className="flex items-center flex-wrap gap-x-1 gap-y-2 px-3 py-2.5 rounded-lg border border-gray-200 bg-white min-h-[42px]">
                {PENDIDIKAN_OPTIONS.map((p, idx) => (
                  <span key={p} className="flex items-center">
                    <button
                      type="button"
                      onClick={() => togglePendidikan(p)}
                      className={`px-1.5 py-0.5 rounded text-sm transition-colors ${
                        pendidikanTerakhir.includes(p)
                          ? "bg-blue-600 text-white font-medium"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                    {idx < PENDIDIKAN_OPTIONS.length - 1 && (
                      <span className="text-gray-300">/</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-100 p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Jurusan</label>
              <input
                type="text"
                value={jurusan}
                onChange={(e) => setJurusan(e.target.value)}
                placeholder="Contoh: Desain Komunikasi Visual"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Pengalaman</label>
              <input
                type="text"
                value={pengalaman}
                onChange={(e) => setPengalaman(e.target.value)}
                placeholder="Minimal 3 tahun di bidang terkait"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-100 p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Keahlian (Hard &amp; Soft Skill)</label>
              <div className="space-y-2">
                {keahlian.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-5 shrink-0 text-sm text-gray-400">{idx + 1}.</span>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateListItem(keahlian, setKeahlian, idx, e.target.value)}
                      placeholder="Skill..."
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Syarat Lain</label>
              <textarea
                value={syaratLain}
                onChange={(e) => setSyaratLain(e.target.value)}
                placeholder="Syarat tambahan lainnya..."
                rows={5}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>
          </div>
        </section>

        {/* ===== 4. Fasilitas & Pendukung ===== */}
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-5">
            <Briefcase className="w-[18px] h-[18px] text-orange-500" />
            Fasilitas &amp; Pendukung
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Bahasa Asing</label>
              <input
                type="text"
                value={bahasaAsing}
                onChange={(e) => setBahasaAsing(e.target.value)}
                placeholder="Contoh: Inggris, Arab"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 mb-2"
              />
              <div className="flex items-center flex-wrap gap-1.5 text-sm">
                <span className="text-gray-500 shrink-0">Kemampuan :</span>
                {KEMAMPUAN_BAHASA_OPTIONS.map((opt, idx) => (
                  <span key={opt} className="flex items-center">
                    <button
                      type="button"
                      onClick={() => toggleKemampuanBahasa(opt)}
                      className={`px-1.5 py-0.5 rounded transition-colors ${
                        kemampuanBahasaAsing.includes(opt)
                          ? "bg-blue-600 text-white font-medium"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      {opt}
                    </button>
                    {idx < KEMAMPUAN_BAHASA_OPTIONS.length - 1 && (
                      <span className="text-gray-300">/</span>
                    )}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Komputer</label>

              {/* Opsi bawaan: klik untuk toggle, bisa pilih lebih dari satu */}
              <div className="flex items-center flex-wrap gap-1.5 mb-3">
                {KOMPUTER_OPTIONS.map((opt) => {
                  const active = komputerSkills.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleKomputerSkill(opt)}
                      className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                        active
                          ? "bg-blue-600 border-blue-600 text-white font-medium"
                          : "border-gray-200 text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Skill custom di luar opsi bawaan, tampil sebagai tag + bisa dihapus */}
              <div className="flex items-center gap-2 flex-wrap">
                {komputerSkills
                  .filter((skill) => !KOMPUTER_OPTIONS.includes(skill))
                  .map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkillTag(skill)}
                        className="text-blue-400 hover:text-blue-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleAddSkillTag}
                  placeholder="+ Tambah lainnya, lalu Enter"
                  className="px-3 py-1.5 rounded-full border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Daftar Fasilitas yang Diberikan</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {fasilitas.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-5 shrink-0 text-sm text-gray-400">{idx + 1}.</span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateListItem(fasilitas, setFasilitas, idx, e.target.value)}
                    placeholder="Contoh: Laptop Kerja, Asuransi, Tunj. Makan..."
                    className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== 5. Peta Kekuatan Karyawan ===== */}
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-5">
            <LayoutGrid className="w-[18px] h-[18px] text-indigo-500" />
            Peta Kekuatan Karyawan
          </h2>

          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-left">
                  <th className="px-4 py-3 font-medium w-12">No</th>
                  <th className="px-4 py-3 font-medium">Level/Tingkat</th>
                  <th className="px-4 py-3 font-medium italic">Requirement / Yg diperlukan</th>
                  <th className="px-4 py-3 font-medium italic">Existing / Yg ada</th>
                  <th className="px-4 py-3 font-medium italic">Balance / Lebih / Kurang</th>
                </tr>
              </thead>
              <tbody>
                {petaKekuatan.map((row, idx) => {
                  const balance = getBalanceInfo(row.requirement, row.existing);
                  return (
                    <tr key={row.level} className="border-t border-gray-100">
                      <td className="px-4 py-2.5 text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-2.5 text-gray-700">{row.level}</td>
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          value={row.requirement}
                          onChange={(e) => updatePeta(idx, "requirement", e.target.value)}
                          placeholder="Contoh: 5"
                          className="w-full px-2.5 py-1.5 rounded-md border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          value={row.existing}
                          onChange={(e) => updatePeta(idx, "existing", e.target.value)}
                          placeholder="Contoh: 3"
                          className="w-full px-2.5 py-1.5 rounded-md border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                        />
                      </td>
                      <td className={`px-4 py-2.5 ${balance.className}`}>{balance.text}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 text-center mt-3">
            Mohon diisi lengkap untuk kajian &amp; pencocokan data Human Capital
          </p>
        </section>

        <div className="flex justify-end pb-4">
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-700 text-white hover:bg-blue-800 transition-colors disabled:opacity-50"
          >
            {submitting ? "Mengirim..." : "Kirim Pengajuan"}
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}