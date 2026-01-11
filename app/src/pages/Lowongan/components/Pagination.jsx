import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

function Pagination({ currentPage, totalPages, onPageChange }) {
  // Jika total halaman hanya 1 atau kurang, tidak perlu menampilkan pagination
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const total = totalPages;
    const current = currentPage;

    // Jika total halaman 5 atau kurang, tampilkan semua angka tanpa titik-titik
    if (total <= 2) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }

    // --- LOGIKA DYNAMIS SESUAI GAMBAR ---

    // 1. Selalu tampilkan halaman pertama
    pages.push(1);

    // 2. Logika Ellipsis Kiri dan Angka Tengah
    if (current <= 2) {
      // Jika di awal: 1, 2, 3, 4 ... 10
      pages.push(2, 3, 4);
      pages.push("...");
    } else if (current >= total - 2) {
      // Jika di akhir: 1 ... 7, 8, 9, 10
      pages.push("...");
      pages.push(total - 3, total - 2, total - 1);
    } else {
      // Jika di tengah: 1 ... 4, 5, 6 ... 10
      pages.push("...");
      pages.push(current - 1, current, current + 1);
      pages.push("...");
    }

    // 3. Selalu tampilkan halaman terakhir
    pages.push(total);

    return pages;
  };

  const displayPages = getPageNumbers();

  return (
    <div className="flex flex-col items-center gap-2 mt-4 p-4">
      <div className="flex justify-center items-center gap-2">
        {/* Tombol First Page << */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-sky-100 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
        >
          <ChevronsLeft size={16} />
        </button>

        {/* Tombol Prev < */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-sky-100 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Angka Halaman Dinamis */}
        <div className="flex items-center gap-1">
          {displayPages.map((page, idx) =>
            page === "..." ? (
              <span
                key={`ellipsis-${idx}`}
                className="w-9 h-9 flex items-center justify-center text-gray-400 font-bold"
              >
                ...
              </span>
            ) : (
              <button
                key={`page-${page}`}
                onClick={() => onPageChange(page)}
                className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold transition duration-200 ${
                  currentPage === page
                    ? "bg-sky-600 text-white shadow-lg scale-110"
                    : "bg-white border border-gray-200 text-gray-700 hover:border-sky-500 hover:text-sky-600 shadow-sm"
                }`}
              >
                {page}
              </button>
            )
          )}
        </div>

        {/* Tombol Next > */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-sky-100 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
        >
          <ChevronRight size={16} />
        </button>

        {/* Tombol Last Page >> */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-sky-100 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default Pagination;