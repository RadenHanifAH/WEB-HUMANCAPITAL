import React, { useEffect, useRef, useState } from "react";
import { Search, Loader2, UserRound } from "lucide-react";
import axiosInstance from "../../../../api/axiosInstance"; // ✅ sesuaikan path kalau beda

/**
 * Input pencarian kandidat dengan autocomplete.
 * - Ketik minimal 2 huruf -> muncul dropdown daftar kandidat yang cocok.
 * - Klik salah satu -> onSelect(candidate) dipanggil, candidate berisi:
 *     { applicationId, applicantName, position, stage, status, tglLahir, profile }
 *
 * Props:
 *  - value: nama yang sedang tampil di input (dikontrol dari form induk)
 *  - onSelect: (candidate) => void
 *  - onChangeText: (text) => void  -> opsional, kalau form induk mau tetap
 *      menyimpan ketikan manual (misal user tidak pilih dari dropdown)
 *  - placeholder
 *  - stage: "interview-pertama" | "psikotes" | "interview-kedua" (opsional).
 *      Kalau diisi, hasil pencarian HANYA menampilkan kandidat yang application-nya
 *      sedang berada di tahap tsb. Kalau kosong, semua tahap ditampilkan.
 *  - stageLabel: label tampilan tahap (untuk pesan "tidak ditemukan"), opsional.
 */
export default function CandidateSearchInput({
  value = "",
  onSelect,
  onChangeText,
  placeholder = "Ketik nama kandidat...",
  disabled = false,
  stage = null,
  stageLabel = "",
}) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  // Sinkronkan kalau form induk mengubah value dari luar (mis. saat mode edit)
  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const text = e.target.value;
    setQuery(text);
    onChangeText?.(text);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/penilaian/search-candidates", {
          params: {
            q: text.trim(),
            ...(stage ? { stage } : {}),
          },
        });
        setResults(res?.data?.items || []);
        setOpen(true);
      } catch (err) {
        console.error("Gagal mencari kandidat:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  const handlePick = (candidate) => {
    setQuery(candidate.applicantName);
    setOpen(false);
    setResults([]);
    onSelect?.(candidate);
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={15}
        />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full border border-gray-200 rounded-lg pl-9 pr-9 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
        />
        {loading && (
          <Loader2
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin"
            size={15}
          />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg z-30 max-h-64 overflow-y-auto">
          {results.map((c) => (
            <button
              key={c.applicationId}
              type="button"
              onClick={() => handlePick(c)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
            >
              {c.profile?.fotoProfile ? (
                <img
                  src={c.profile.fotoProfile}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
              ) : (
                <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <UserRound size={15} />
                </span>
              )}
              <span className="min-w-0">
                <span className="block text-sm font-medium text-gray-800 truncate">
                  {c.applicantName}
                </span>
                <span className="block text-xs text-gray-400 truncate">
                  {c.position || "Posisi tidak diketahui"}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      {open && !loading && query.trim().length >= 2 && results.length === 0 && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg z-30 px-4 py-3 text-sm text-gray-400">
          {stage
            ? `Tidak ada kandidat pada tahap ${stageLabel || "ini"} yang cocok dengan "${query}"`
            : `Tidak ada kandidat yang cocok dengan "${query}"`}
        </div>
      )}
    </div>
  );
}