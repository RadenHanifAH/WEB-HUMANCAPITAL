// src/pages/Users/Profile/sections/DataPribadiSection.jsx
import React from "react";
import { Edit2, Save } from "lucide-react";

/* ── tiny reusable field ─────────────────────────────────── */
const Field = ({ label, value, name, editable, onChange, type = "text" }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
      {label}
    </label>
    {editable ? (
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800
                   focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100
                   transition placeholder:text-gray-400"
        placeholder={`Masukkan ${label.toLowerCase()}`}
      />
    ) : (
      <div
        className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm
                      text-gray-800 min-h-[42px]"
      >
        {value || <span className="italic text-gray-400">Belum diisi</span>}
      </div>
    )}
  </div>
);

const TextareaField = ({ label, value, name, editable, onChange }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
      {label}
    </label>
    {editable ? (
      <textarea
        name={name}
        value={value || ""}
        onChange={onChange}
        rows={3}
        className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800
                   focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100
                   transition resize-none placeholder:text-gray-400"
        placeholder={`Masukkan ${label.toLowerCase()}`}
      />
    ) : (
      <div
        className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm
                      text-gray-800 min-h-[42px] whitespace-pre-wrap"
      >
        {value || <span className="italic text-gray-400">Belum diisi</span>}
      </div>
    )}
  </div>
);

/* ── helper: rentang tanggal lahir yang diizinkan ────────── */
// Aturan usia pelamar — ganti angkanya di sini saja kalau kebijakan berubah:
const UMUR_MINIMAL = 17;  // usia termuda -> tanggal lahir TERBARU = hari ini - 17 tahun
const UMUR_MAKSIMAL = 40; // usia tertua -> tanggal lahir TERLAMA = hari ini - 40 tahun

// Format YYYY-MM-DD memakai tanggal LOKAL (bukan toISOString yang UTC),
// supaya batasnya tidak geser ±1 hari karena selisih zona waktu (WIB = UTC+7).
const toInputDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// Batas dihitung dari tanggal hari ini, jadi otomatis ikut berganti tahun.
// Contoh: tahun 2026 -> rentang 3 Sep 1986 s.d. 3 Sep 2009 (usia 17-40).
const getTanggalLahirRange = () => {
  const today = new Date();

  // MAX = hari ini dikurangi 17 tahun
  // -> di bawah 17 tahun (kemarin, anak kecil, remaja) otomatis INVALID
  const max = new Date(today);
  max.setFullYear(today.getFullYear() - UMUR_MINIMAL);

  // MIN = hari ini dikurangi 40 tahun
  // -> di atas 40 tahun juga INVALID
  const min = new Date(today);
  min.setFullYear(today.getFullYear() - UMUR_MAKSIMAL);

  return { min: toInputDate(min), max: toInputDate(max) };
};

/* ── main component ──────────────────────────────────────── */
const DataPribadiSection = ({
  editedData,
  isEditable,
  onEdit,
  onCancel,
  onSave,
  onChange,
}) => {
  // ✅ Persis bentuk toSafeUser() di auth.service.js:
  // { nama, email, profil: { nik, jenis_kelamin, nomor_hp, tempat_lahir,
  //   tanggal_lahir, alamat, foto_profil, tentang } }
  // `nama` cuma ada di level atas (kolom pengguna.nama), tidak ada
  // duplikasi di dalam `profil` (model profil tidak punya kolom nama).
  const { nama, email, profil = {} } = editedData || {};

  const {
    nik,
    jenis_kelamin,
    nomor_hp,
    tempat_lahir,
    tanggal_lahir,
    alamat,
  } = profil;

  // rentang tanggal lahir dihitung dari tanggal hari ini
  const { min: minTglLahir, max: maxTglLahir } = getTanggalLahirRange();

  // format tanggal untuk display
  const formatDate = (d) => {
    if (!d) return "";
    try {
      return new Date(d).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return d;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // ✅ Guard: abaikan tanggal lahir di luar rentang usia 17-40 tahun.
    // (perlu, karena user masih bisa KETIK manual lewat keyboard
    //  walaupun date picker-nya sudah dibatasi min/max)
    if (name === "tanggal_lahir" && value) {
      if (value > maxTglLahir || value < minTglLahir) return;
    }

    onChange({ target: { id: name, value } });
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
      {/* ── header ── */}
      <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
        <div>
          <h3 className="text-base font-bold text-gray-900">Data Pribadi</h3>
          <p className="mt-0.5 text-sm text-gray-500">
            Pastikan data pribadi benar untuk mempermudah proses pendaftaran
          </p>
        </div>

        {isEditable ? (
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <button
              onClick={onCancel}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm
                         text-gray-600 hover:bg-gray-50 transition"
            >
              Batalkan
            </button>
            <button
              onClick={onSave}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5
                         text-sm font-semibold text-white hover:bg-blue-700 transition shadow-sm"
            >
              <Save size={15} />
              Simpan
            </button>
          </div>
        ) : (
          <button
            onClick={onEdit}
            className="ml-4 rounded-full p-2 text-gray-400 hover:bg-gray-100
                       hover:text-blue-600 transition shrink-0"
            aria-label="Edit data pribadi"
          >
            <Edit2 size={16} />
          </button>
        )}
      </div>

      {/* ── body: two columns ── */}
      <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
        {/* ── Biodata column ── */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-l-4 border-blue-600 pl-3">
            <h4 className="text-sm font-bold text-gray-800">Biodata</h4>
          </div>

          {/* Nama Lengkap — kolom pengguna.nama, di level atas editedData */}
          <Field
            label="Nama Lengkap"
            name="nama"
            value={nama || ""}
            editable={isEditable}
            onChange={handleChange}
          />

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="NIK"
              name="nik"
              value={nik}
              editable={isEditable}
              onChange={handleChange}
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Jenis Kelamin
              </label>
              {isEditable ? (
                <select
                  name="jenis_kelamin"
                  value={jenis_kelamin || ""}
                  onChange={handleChange}
                  className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm
                             text-gray-800 focus:border-blue-500 focus:outline-none
                             focus:ring-2 focus:ring-blue-100 transition bg-white"
                >
                  <option value="">Pilih</option>
                  <option value="Laki-Laki">Laki-Laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              ) : (
                <div
                  className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5
                                text-sm text-gray-800 min-h-[42px]"
                >
                  {jenis_kelamin || (
                    <span className="italic text-gray-400">Belum diisi</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Tempat Lahir"
              name="tempat_lahir"
              value={tempat_lahir}
              editable={isEditable}
              onChange={handleChange}
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Tanggal Lahir
              </label>
              {isEditable ? (
                <>
                  <input
                    type="date"
                    name="tanggal_lahir"
                    min={minTglLahir}
                    max={maxTglLahir}
                    value={
                      tanggal_lahir
                        ? new Date(tanggal_lahir).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={handleChange}
                    className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm
                               text-gray-800 focus:border-blue-500 focus:outline-none
                               focus:ring-2 focus:ring-blue-100 transition"
                  />
                  <p className="text-[11px] text-gray-400">
                    Usia pelamar {UMUR_MINIMAL}–{UMUR_MAKSIMAL} tahun
                  </p>
                </>
              ) : (
                <div
                  className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5
                                text-sm text-gray-800 min-h-[42px]"
                >
                  {tanggal_lahir ? (
                    formatDate(tanggal_lahir)
                  ) : (
                    <span className="italic text-gray-400">Belum diisi</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Kontak & Lokasi column ── */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-l-4 border-blue-600 pl-3">
            <h4 className="text-sm font-bold text-gray-800">Kontak & Lokasi</h4>
          </div>

          {/* Email — read only always */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Email
            </label>
            <div
              className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-2.5
                            text-sm text-gray-700 min-h-[42px]"
            >
              {email || (
                <span className="italic text-gray-400">Belum diisi</span>
              )}
            </div>
          </div>

          <Field
            label="No. Handphone"
            name="nomor_hp"
            value={nomor_hp}
            editable={isEditable}
            onChange={handleChange}
            type="tel"
          />

          <TextareaField
            label="Alamat Domisili"
            name="alamat"
            value={alamat}
            editable={isEditable}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
};

export default DataPribadiSection;