/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FileText,
  Users,
  ShieldCheck,
  Briefcase,
  LayoutGrid,
  Plus,
  X,
  Save,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "../../api/axiosInstance";

const STATUS_KARYAWAN_OPTIONS = [
  "Tetap",
  "Kontrak",
  "Harian Lepas",
  "Freelance",
];
const PENDIDIKAN_OPTIONS = [
  "SMA/SMK",
  "D3",
  "S1 (Sarjana)",
  "S2 (Magister)",
  "S3 (Doktor)",
];
const LEVEL_BAHASA_OPTIONS = ["Dasar", "Menengah", "Mahir", "Ahli"];
const FASILITAS_OPTIONS = [
  "Laptop Kerja",
  "Asuransi",
  "Tunj. Makan",
  "Pulsa/Data",
];
const LOKASI_OPTIONS = ["Bandung", "Surabaya", "Jakarta"];
const PETA_LEVEL_DEFAULT = [
  { level: "Operator", requirement: "", existing: "" },
  { level: "Supervisor / Staf", requirement: "", existing: "" },
  { level: "Section Chief", requirement: "", existing: "" },
  { level: "Manajer", requirement: "", existing: "" },
];

// ✅ FIX: Logika Balance yang benar
// Total Dibutuhkan 5, Existing 3 -> 5 - 3 = 2 -> Kurang 2 (Merah)
// Total Dibutuhkan 3, Existing 5 -> 3 - 5 = -2 -> Lebih 2 (Hijau)
function getBalanceInfo(requirement, existing) {
  const req = Number(requirement);
  const exi = Number(existing);

  // Cek apakah salah satu kolom masih kosong
  if ((requirement === "" || requirement == null) || (existing === "" || existing == null)) {
    return { text: "-", className: "text-gray-400" };
  }
  if (Number.isNaN(req) || Number.isNaN(exi)) {
    return { text: "-", className: "text-gray-400" };
  }

  const diff = req - exi;

  if (diff > 0) {
    return { text: `Kurang ${diff}`, className: "text-red-600 font-medium" };
  }
  if (diff < 0) {
    return { text: `Lebih ${Math.abs(diff)}`, className: "text-emerald-600 font-medium" };
  }
  return { text: "Pas", className: "text-gray-500 font-medium" };
}

function toDateInput(val) {
  if (!val) return "";
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

export default function EditPengajuanSDM() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [departemen, setDepartemen] = useState("");
  const [tanggalPermintaan, setTanggalPermintaan] = useState("");
  const [posisi, setPosisi] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [alasan, setAlasan] = useState("");

  const [jumlah, setJumlah] = useState(1);
  const [statusKaryawan, setStatusKaryawan] = useState("");
  const [tugasUtama, setTugasUtama] = useState(["", "", ""]);

  const [usiaMin, setUsiaMin] = useState("");
  const [usiaMaks, setUsiaMaks] = useState("");
  const [statusPerkawinan, setStatusPerkawinan] = useState([]);
  const [pendidikanTerakhir, setPendidikanTerakhir] = useState("S1 (Sarjana)");
  const [keahlian, setKeahlian] = useState(["", ""]);
  const [pengalaman, setPengalaman] = useState("");

  const [bahasaAsing, setBahasaAsing] = useState("");
  const [levelBahasaAsing, setLevelBahasaAsing] = useState("Ahli");
  const [komputerSkills, setKomputerSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [fasilitas, setFasilitas] = useState([]);

  const [petaKekuatan, setPetaKekuatan] = useState(PETA_LEVEL_DEFAULT);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: res } = await axios.get(`/divisi/pengajuan/${id}`);
        const d = res.data;

        setDepartemen(d.departemen ?? "");
        setTanggalPermintaan(toDateInput(d.tanggal_permintaan));
        setPosisi(d.posisi ?? "");
        setLokasi(d.lokasi ?? "");
        setAlasan(d.alasan ?? "");
        setJumlah(d.jumlah ?? 1);
        setStatusKaryawan(d.status_karyawan ?? "");
        setTugasUtama(d.tugas_utama?.length ? d.tugas_utama : ["", "", ""]);
        setUsiaMin(d.usia_min ?? "");
        setUsiaMaks(d.usia_maks ?? "");
        setStatusPerkawinan(d.status_perkawinan ?? []);
        setPendidikanTerakhir(d.pendidikan_terakhir ?? "S1 (Sarjana)");
        setKeahlian(d.keahlian?.length ? d.keahlian : ["", ""]);
        setPengalaman(d.pengalaman ?? "");
        setBahasaAsing(d.bahasa_asing ?? "");
        setLevelBahasaAsing(d.level_bahasa_asing ?? "Ahli");
        setKomputerSkills(d.keahlian_komputer ?? []);
        setFasilitas(d.fasilitas ?? []);

        if (d.peta_kekuatan?.length) {
          const merged = PETA_LEVEL_DEFAULT.map((def) => {
            const found = d.peta_kekuatan.find((p) => p.level === def.level);
            return found
              ? {
                  ...def,
                  requirement: found.requirement ?? "",
                  existing: found.existing ?? "",
                }
              : def;
          });
          setPetaKekuatan(merged);
        }
      } catch (err) {
        toast.error("Gagal memuat data pengajuan");
        navigate("/divisi/dashboard");
      } finally {
        setLoadingData(false);
      }
    }
    fetchData();
  }, [id]);

  const updateListItem = (list, setList, index, value) => {
    const next = [...list];
    next[index] = value;
    setList(next);
  };
  const addListItem = (list, setList) => setList([...list, ""]);
  const removeListItem = (list, setList, index) =>
    setList(list.filter((_, i) => i !== index));
  const toggleInArray = (value, arr, setArr) =>
    setArr((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );

  const handleAddSkillTag = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      setKomputerSkills((prev) => [...prev, skillInput.trim()]);
      setSkillInput("");
    }
  };
  const removeSkillTag = (index) =>
    setKomputerSkills((prev) => prev.filter((_, i) => i !== index));

  const updatePeta = (index, field, value) =>
    setPetaKekuatan((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });

  const handleSave = async () => {
    if (!departemen || !posisi || !lokasi) {
      toast.error("Departemen, Posisi, dan Lokasi wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      await axios.put(`/divisi/pengajuan/${id}`, {
        departemen,
        tanggal_permintaan: tanggalPermintaan || undefined,
        posisi,
        lokasi,
        alasan: alasan || null,
        jumlah: Number(jumlah) || 1,
        status_karyawan: statusKaryawan,
        tugas_utama: tugasUtama.filter((t) => t.trim() !== ""),
        usia_min: usiaMin ? Number(usiaMin) : null,
        usia_maks: usiaMaks ? Number(usiaMaks) : null,
        status_perkawinan: statusPerkawinan,
        pendidikan_terakhir: pendidikanTerakhir,
        keahlian: keahlian.filter((k) => k.trim() !== ""),
        pengalaman: pengalaman || null,
        bahasa_asing: bahasaAsing,
        level_bahasa_asing: levelBahasaAsing,
        keahlian_komputer: komputerSkills,
        fasilitas: fasilitas,
        peta_kekuatan: petaKekuatan.map((p) => ({
          level: p.level,
          requirement: p.requirement,
          existing: p.existing,
        })),
      });

      toast.success("Pengajuan berhasil diperbarui.");
      navigate("/divisi/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal menyimpan perubahan.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] gap-3 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Memuat data pengajuan...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Pengajuan SDM
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Perbarui data pengajuan sumber daya manusia.
          </p>
        </div>
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
              <label className="block text-sm text-gray-600 mb-1.5">
                Dept. / Divisi
              </label>
              <input
                type="text"
                value={departemen}
                onChange={(e) => setDepartemen(e.target.value)}
                placeholder="Contoh: IT, Marketing, Finance"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">
                Tanggal Permintaan
              </label>
              <input
                type="date"
                value={tanggalPermintaan}
                onChange={(e) => setTanggalPermintaan(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">
                Posisi Pekerjaan / Jabatan
              </label>
              <input
                type="text"
                value={posisi}
                onChange={(e) => setPosisi(e.target.value)}
                placeholder="Contoh: Senior Graphic Designer"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">
                Lokasi Penempatan
              </label>
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
              <label className="block text-sm text-gray-600 mb-1.5">
                Alasan Permintaan SDM
              </label>
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
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">
                  Jumlah (Orang)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    value={jumlah}
                    onChange={(e) => setJumlah(e.target.value)}
                    className="w-24 px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  />
                  <span className="text-sm text-gray-400 italic">Kandidat</span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Status Karyawan
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {STATUS_KARYAWAN_OPTIONS.map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 cursor-pointer hover:border-blue-300"
                    >
                      <input
                        type="radio"
                        name="statusKaryawan"
                        checked={statusKaryawan === opt}
                        onChange={() => setStatusKaryawan(opt)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-400"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm text-gray-600 mb-2">
                Tugas & Tanggung Jawab Utama
              </label>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                {tugasUtama.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) =>
                        updateListItem(
                          tugasUtama,
                          setTugasUtama,
                          idx,
                          e.target.value,
                        )
                      }
                      placeholder={`${idx + 1}. Tanggung jawab...`}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                    />
                    {tugasUtama.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeListItem(tugasUtama, setTugasUtama, idx)
                        }
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

        {/* ===== 3. Kualifikasi ===== */}
        <section className="bg-gray-50/60 rounded-xl border border-gray-100 p-6 space-y-5">
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <ShieldCheck className="w-[18px] h-[18px] text-emerald-600" />
            Kualifikasi (Standard)
          </h2>
          <div className="bg-white rounded-lg border border-gray-100 p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">
                Usia (Rentang)
              </label>
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
              <label className="block text-sm text-gray-600 mb-1.5">
                Status Perkawinan
              </label>
              <div className="flex items-center gap-4 h-[42px]">
                {["Kawin", "Belum Kawin"].map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={statusPerkawinan.includes(opt)}
                      onChange={() =>
                        toggleInArray(
                          opt,
                          statusPerkawinan,
                          setStatusPerkawinan,
                        )
                      }
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-400"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">
                Pendidikan Terakhir
              </label>
              <select
                value={pendidikanTerakhir}
                onChange={(e) => setPendidikanTerakhir(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              >
                {PENDIDIKAN_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-100 p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Keahlian (Hard & Soft Skills)
              </label>
              <div className="space-y-2">
                {keahlian.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) =>
                        updateListItem(
                          keahlian,
                          setKeahlian,
                          idx,
                          e.target.value,
                        )
                      }
                      placeholder={
                        idx === 0
                          ? "1. Skill utama..."
                          : `${idx + 1}. Skill pendukung...`
                      }
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                    />
                    {keahlian.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeListItem(keahlian, setKeahlian, idx)
                        }
                        className="text-gray-300 hover:text-red-500 shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addListItem(keahlian, setKeahlian)}
                  className="flex items-center gap-1.5 text-sm text-blue-600 font-medium pt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah skill
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">
                Pengalaman & Syarat Lain
              </label>
              <textarea
                value={pengalaman}
                onChange={(e) => setPengalaman(e.target.value)}
                placeholder="Minimal 3 tahun pengalaman di bidang terkait..."
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
            Fasilitas & Pendukung
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">
                Bahasa Asing
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={bahasaAsing}
                  onChange={(e) => setBahasaAsing(e.target.value)}
                  placeholder="Contoh: Inggris, Arab"
                  className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                />
                <select
                  value={levelBahasaAsing}
                  onChange={(e) => setLevelBahasaAsing(e.target.value)}
                  className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                >
                  {LEVEL_BAHASA_OPTIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">
                Kemampuan Komputer
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {komputerSkills.map((skill, idx) => (
                  <span
                    key={`${skill}-${idx}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkillTag(idx)}
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
                  placeholder="+ Tambah skill, lalu Enter"
                  className="px-3 py-1.5 rounded-full border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Daftar Fasilitas yang Diberikan
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {FASILITAS_OPTIONS.map((opt) => (
                <label
                  key={opt}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 cursor-pointer hover:border-blue-300"
                >
                  <input
                    type="checkbox"
                    checked={fasilitas.includes(opt)}
                    onChange={() => toggleInArray(opt, fasilitas, setFasilitas)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-400"
                  />
                  {opt}
                </label>
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
                  <th className="px-4 py-3 font-medium">Level / Tingkat</th>
                  <th className="px-4 py-3 font-medium">
                    Total Dibutuhkan (Full Team)
                  </th>
                  <th className="px-4 py-3 font-medium">Existing (Sudah Ada)</th>
                  <th className="px-4 py-3 font-medium">
                    Balance (Kurang/Lebih)
                  </th>
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
                          onChange={(e) =>
                            updatePeta(idx, "requirement", e.target.value)
                          }
                          placeholder="Contoh: 5"
                          className="w-full px-2.5 py-1.5 rounded-md border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          value={row.existing}
                          onChange={(e) =>
                            updatePeta(idx, "existing", e.target.value)
                          }
                          placeholder="Contoh: 3"
                          className="w-full px-2.5 py-1.5 rounded-md border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                        />
                      </td>
                      <td className={`px-4 py-2.5 ${balance.className}`}>
                        {balance.text}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 text-center mt-3">
            Mohon diisi lengkap untuk kajian & pencocokan data Human Capital
          </p>
        </section>

        <div className="flex justify-end gap-3 pb-4">
          <button
            type="button"
            onClick={() => navigate("/divisi/dashboard")}
            className="px-5 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-700 text-white hover:bg-blue-800 transition-colors disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}