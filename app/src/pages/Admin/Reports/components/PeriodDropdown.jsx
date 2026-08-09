import React from "react";

// Segmented control ala gambar referensi: Harian | Mingguan | Bulanan | Tahunan
export default function PeriodDropdown({ selected, onChange, options }) {
  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
      {options.map((opt) => {
        const isActive = selected?.id === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              isActive
                ? "bg-white text-sky-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}