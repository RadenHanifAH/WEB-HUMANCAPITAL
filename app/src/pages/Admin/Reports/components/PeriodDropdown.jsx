import React from "react";
import { Listbox } from "@headlessui/react";
import { periodOptions } from "../utils/constants";

export default function PeriodDropdown({ selected, onChange }) {
  return (
    <Listbox value={selected} onChange={onChange}>
      <div className="relative w-32">
        <Listbox.Button className="w-full flex justify-between items-center px-3 py-2 border rounded-lg bg-white text-sm shadow-sm hover:border-sky-300 transition-colors focus:outline-none">
          <span className="truncate">{selected?.label}</span>
          <span className="text-gray-500">▾</span>
        </Listbox.Button>

        <Listbox.Options className="absolute mt-1 w-full bg-white border rounded-lg shadow-lg z-20 text-sm overflow-hidden">
          {periodOptions.map((opt) => (
            <Listbox.Option
              key={opt.id}
              value={opt}
              className={({ active }) =>
                `px-3 py-2 cursor-pointer transition-colors ${
                  active ? "bg-sky-100 text-sky-700" : "text-gray-700"
                }`
              }
            >
              {opt.label}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
}
