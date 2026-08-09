import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Menghasilkan daftar nomor halaman dengan elipsis, mis: [1, 2, 3, "...", 14]
const buildPageList = (current, total) => {
  const delta = 1;
  const range = [];
  const rangeWithDots = [];
  let last;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }

  range.forEach((i) => {
    if (last) {
      if (i - last === 2) {
        rangeWithDots.push(last + 1);
      } else if (i - last > 2) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(i);
    last = i;
  });

  return rangeWithDots;
};

export default function Pagination({ page, pageSize, total, onPageChange, loading }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const pages = useMemo(() => buildPageList(page, totalPages), [page, totalPages]);

  return (
    <div className="flex items-center justify-center gap-1.5 pt-4">
      <button
        type="button"
        disabled={page <= 1 || loading}
        onClick={() => onPageChange(page - 1)}
        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="w-8 h-8 flex items-center justify-center text-sm text-gray-400">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            disabled={loading}
            className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition ${
              p === page
                ? "bg-sky-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        disabled={page >= totalPages || loading}
        onClick={() => onPageChange(page + 1)}
        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}