import React from "react";
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const getRange = () => {
    if (totalPages <= 5) return [...Array(totalPages)].map((_, i) => i + 1);
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, page + 2);
    if (page <= 3) end = 5;
    else if (page > totalPages - 2) start = totalPages - 4;

    const r = [];
    for (let i = start; i <= end; i++) r.push(i);
    return r;
  };

  const range = getRange();

  const btn = (disabled) =>
    `w-10 h-10 flex items-center justify-center rounded-full transition-colors border border-gray-300 ${
      disabled ? "text-gray-400 cursor-not-allowed bg-gray-50" : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <button className={btn(page === 1)} disabled={page === 1} onClick={() => onChange(1)}>
        <ChevronsLeft className="w-4 h-4" />
      </button>

      <button className={btn(page === 1)} disabled={page === 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft className="w-4 h-4" />
      </button>

      {range.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-10 h-10 rounded-full font-medium transition-colors border border-gray-300 ${
            page === p ? "bg-sky-700 text-white shadow-md" : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          {p}
        </button>
      ))}

      <button className={btn(page === totalPages)} disabled={page === totalPages} onClick={() => onChange(page + 1)}>
        <ChevronRight className="w-4 h-4" />
      </button>

      <button className={btn(page === totalPages)} disabled={page === totalPages} onClick={() => onChange(totalPages)}>
        <ChevronsRight className="w-4 h-4" />
      </button>
    </div>
  );
}
