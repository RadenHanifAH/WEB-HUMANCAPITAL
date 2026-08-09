import React from "react";

/**
 * RadioGroup - dipakai untuk pilihan Baik/Buruk dan Kesimpulan Test.
 */
const RadioGroup = ({ name, options, value, onChange, layout = "row" }) => {
  return (
    <div
      className={
        layout === "row" ? "flex flex-wrap gap-4" : "flex flex-col gap-2"
      }
    >
      {options.map((opt) => (
        <label
          key={opt}
          className="flex items-center gap-2 cursor-pointer text-sm"
        >
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={(e) => onChange(e.target.value)}
            className="w-4 h-4 accent-gray-800"
          />
          <span>{opt}</span>
        </label>
      ))}
    </div>
  );
};

export default RadioGroup;
