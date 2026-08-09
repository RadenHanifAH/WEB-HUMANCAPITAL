import React, { useEffect, useRef, useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { formatRangeLabel, isRangeValid } from "../utils/dateUtils";

export default function DateRangePicker({ range, onApply, onClear }) {
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState(range?.start || "");
  const [end, setEnd] = useState(range?.end || "");
  const [error, setError] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    setStart(range?.start || "");
    setEnd(range?.end || "");
  }, [range?.start, range?.end]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleApply = () => {
    if (!isRangeValid(start, end)) {
      setError("Periode awal harus sebelum atau sama dengan periode akhir.");
      return;
    }
    setError("");
    onApply({ start, end });
    setOpen(false);
  };

  const handleClear = () => {
    setStart("");
    setEnd("");
    setError("");
    onClear();
    setOpen(false);
  };

  const label = range?.start && range?.end ? formatRangeLabel(range.start, range.end) : "Pilih Periode";

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
      >
        <Calendar className="h-4 w-4 text-sky-600" />
        <span className="text-gray-700 font-medium">{label}</span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-4">
          <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
            Custom Periode
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Dari</label>
              <input
                type="month"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Sampai</label>
              <input
                type="month"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

          <div className="flex items-center justify-between mt-4">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Reset ke default
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-3 py-1.5 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors"
            >
              Terapkan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
