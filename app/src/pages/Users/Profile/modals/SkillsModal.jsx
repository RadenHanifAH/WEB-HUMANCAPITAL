import React, { useEffect, useState } from "react";
import { X, Plus, Loader2 as LoaderIcon } from "lucide-react";
import axios from "../../../../api/axiosInstance";


const SkillsModal = ({ isOpen, currentSkills = [], onClose, onSuccess }) => {
  const [skillNames, setSkillNames] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Sinkronkan state lokal setiap kali modal dibuka
  useEffect(() => {
    if (isOpen) {
      // ⚠️ FIX: kolom Prisma model `keahlian_pengguna` bernama `nama`
      // (bukan `name`), jadi baca dari situ.
      setSkillNames(currentSkills.map((s) => s.nama));
      setInputValue("");
      setError(null);
    }
  }, [isOpen, currentSkills]);

  if (!isOpen) return null;

  const addSkill = () => {
    const trimmed = inputValue.trim();

    if (!trimmed) return;

    const alreadyExists = skillNames.some(
      (name) => name.toLowerCase() === trimmed.toLowerCase(),
    );

    if (alreadyExists) {
      setError("Skill ini sudah ditambahkan");
      return;
    }

    setSkillNames((prev) => [...prev, trimmed]);
    setInputValue("");
    setError(null);
  };

  const removeSkill = (name) => {
    setSkillNames((prev) => prev.filter((s) => s !== name));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const res = await axios.put("/profile/skills", {
        skills: skillNames,
      });

      // Backend mengembalikan { success, message, data: null } pada replaceUserSkills,
      // jadi kita bentuk ulang array skill di sisi client untuk ditampilkan langsung.
      // ⚠️ FIX: key `nama` (bukan `name`) supaya konsisten dengan kolom
      // Prisma saat item ini dipakai lagi di komponen lain (mis. SkillsSection).
      const newSkills = skillNames.map((name, idx) => ({
        id: res?.data?.data?.[idx]?.id ?? `temp-${idx}-${name}`,
        nama: name,
      }));

      onSuccess?.(newSkills);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal menyimpan skills.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Edit Skills</h3>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input tambah skill */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tulis skill, lalu tekan Enter"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          />

          <button
            type="button"
            onClick={addSkill}
            className="inline-flex items-center gap-1 bg-sky-600 hover:bg-sky-700 text-white px-3 py-2 rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Tambah
          </button>
        </div>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        {/* Daftar skill saat ini */}
        <div className="flex flex-wrap gap-2 min-h-[40px] mb-6">
          {skillNames.length === 0 ? (
            <p className="text-sm text-gray-400">Belum ada skill</p>
          ) : (
            skillNames.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-100 text-sky-800 text-sm font-medium"
              >
                {name}

                <button
                  type="button"
                  onClick={() => removeSkill(name)}
                  className="text-sky-500 hover:text-sky-800"
                  aria-label={`Hapus ${name}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))
          )}
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-60"
          >
            {saving && <LoaderIcon className="w-4 h-4 animate-spin" />}
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillsModal;