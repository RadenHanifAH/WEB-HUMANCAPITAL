import React, { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronDown, Check } from "lucide-react";
import { interviewTypes } from "./constants";

export default function TypeFilter({ value, onChange }) {
  const current = value === "all"
    ? { value: "all", label: "Semua Tipe" }
    : interviewTypes.find((t) => t.value === value) || { value, label: value };

  return (
    <Listbox value={value} onChange={onChange}>
      {({ open }) => (
        <div className="relative w-44">
          <Listbox.Button className="w-full flex justify-between items-center px-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm text-left text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors">
            <span>{current.label}</span>
            <ChevronDown className={`w-4 h-4 text-gray-500 ml-1 transition-transform ${open ? "rotate-180" : ""}`} />
          </Listbox.Button>

          <Transition as={Fragment} enter="transition duration-100 ease-out" enterFrom="transform scale-95 opacity-0" enterTo="transform scale-100 opacity-100" leave="transition duration-75 ease-out" leaveFrom="transform scale-100 opacity-100" leaveTo="transform scale-95 opacity-0">
            <Listbox.Options className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 text-sm max-h-60 overflow-auto">
              <Listbox.Option value="all">
                {({ active, selected }) => (
                  <div className={`flex justify-between items-center px-3 py-2 cursor-pointer rounded-md ${active ? "bg-sky-100 text-sky-700" : "text-gray-700"}`}>
                    <span>Semua Tipe</span>
                    {selected && <Check className="w-4 h-4 text-sky-600" />}
                  </div>
                )}
              </Listbox.Option>

              {interviewTypes.map((opt) => (
                <Listbox.Option key={opt.value} value={opt.value}>
                  {({ active, selected }) => (
                    <div className={`flex justify-between items-center px-3 py-2 cursor-pointer rounded-md ${active ? "bg-sky-100 text-sky-700" : "text-gray-700"}`}>
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
