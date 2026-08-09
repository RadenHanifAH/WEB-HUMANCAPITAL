import React, { useState } from "react";
import { Edit2, Save } from "lucide-react";

const TentangSayaSection = ({ tentang = "", onSave }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(tentang);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ tentang: value });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  React.useEffect(() => {
    if (!editing) setValue(tentang);
  }, [tentang, editing]);

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
        <h3 className="text-base font-bold text-gray-900">Tentang Saya</h3>
        {editing ? (
          <div className="flex items-center gap-2 ml-4 shrink-0">
            <button
              onClick={() => {
                setEditing(false);
                setValue(tentang);
              }}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              Batalkan
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-sm disabled:opacity-60"
            >
              <Save size={15} />
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="ml-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition shrink-0"
            aria-label="Edit tentang saya"
          >
            <Edit2 size={16} />
          </button>
        )}
      </div>

      <div className="px-6 py-5">
        {editing ? (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={5}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition resize-none"
            placeholder="Ceritakan tentang dirimu, pengalaman, dan keahlianmu..."
          />
        ) : (
          <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
            {tentang || (
              <span className="italic text-gray-400">
                Belum ada deskripsi. Klik edit untuk menambahkan.
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default TentangSayaSection;