import React from "react";
import { Listbox } from "@headlessui/react";
import { ChevronDown, Check } from "lucide-react";

const options = [
  { value: "all", label: "Status" },
  { value: "sent", label: "Terkirim" },
  { value: "failed", label: "Gagal" },
];

export default function StatusFilter({ value, onChange }) {
  const selected = options.find((o) => o.value === value) || options[0];

  return (
    <Listbox value={selected.value} onChange={onChange}>
      {({ open }) => (
        <div className="relative w-44">
          <Listbox.Button className="w-full flex justify-between items-center px-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm text-left text-sm focus:outline-none focus:ring-1 focus:ring-sky-500">
            <span>{selected.label}</span>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 ml-1 transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
          </Listbox.Button>

          <Listbox.Options className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 text-sm overflow-hidden">
            {options.map((opt) => (
              <Listbox.Option key={opt.value} value={opt.value}>
                {({ active, selected }) => (
                  <div
                    className={`flex justify-between items-center px-3 py-2 cursor-pointer ${
                      active ? "bg-sky-100 text-sky-700" : "text-gray-700"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {selected && <Check className="w-4 h-4 text-sky-600" />}
                  </div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      )}
    </Listbox>
  );
}
