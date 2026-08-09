import React from "react";

/**
 * RatingSelect - dipakai di dalam tabel penilaian aspek wawancara
 * untuk memilih Kurang / Cukup / Baik per baris.
 */
const RatingSelect = ({ options, value, onChange }) => {
  return (
    <div className="flex justify-center gap-3">
      {options.map((opt) => (
        <label
          key={opt}
          className="flex flex-col items-center gap-1 cursor-pointer"
        >
          <input
            type="radio"
            checked={value === opt}
            onChange={() => onChange(opt)}
            className="w-4 h-4 accent-gray-800"
          />
        </label>
      ))}
    </div>
  );
};

export default RatingSelect;
