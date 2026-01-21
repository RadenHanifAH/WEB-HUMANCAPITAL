import React, { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronDown, Check } from "lucide-react";

export default function StatusFilter({ value = "all", onChange }) {
  const options = [
    { value: "all", label: "Semua Status" },
    { value: "accepted", label: "Diterima" },
    { value: "rejected", label: "Ditolak" },
  ];

  const current = options.find((o) => o.value === value) || options[0];

  return (
    <Listbox value={value} onChange={onChange}>
      {({ open }) => (
        <div className="relative w-44">
          <Listbox.Button className="w-full flex justify-between items-center px-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm text-left text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30">
            <span className="truncate">{current.label}</span>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 ml-1 transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
          </Listbox.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 text-sm p-1">
              {options.map((opt) => (
                <Listbox.Option key={opt.value} value={opt.value}>
                  {({ active, selected }) => (
                    <div
                      className={`flex justify-between items-center px-3 py-2 cursor-pointer rounded-md ${
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
          </Transition>
        </div>
      )}
    </Listbox>
  );
}
