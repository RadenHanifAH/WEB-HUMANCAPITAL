import React from "react";
import { SCHEDULE_TYPES } from "./constants";

export default function TypeFilter({ value, onChange }) {
  return (
    <div className="inline-flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-max max-w-full overflow-x-auto">
      {SCHEDULE_TYPES.map((t) => {
        const active = value === t.value;
        return (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              active
                ? "bg-white text-sky-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}