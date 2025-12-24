import React, { Fragment } from 'react';
import { Search, ChevronDown, Check, FileSpreadsheet } from "lucide-react";
import { Listbox, Transition } from "@headlessui/react";
import { statusOptions, blockedScoreStages } from "../utils/constants";
import { formatDate } from "../utils/helpers";

const FilterBar = ({ search, setSearch, filterStatus, setFilterStatus, filterPosisi, setFilterPosisi, jobPositions, filteredApplicants }) => {
  
  const handleExport = () => {
    const header = ["Nama", "Email", "Posisi", "Tahap Seleksi", "Score", "Tanggal Lamar"];
    const rows = filteredApplicants.map(a => [
      a.name, a.email, a.position, a.stage,
      blockedScoreStages.includes(a.status) ? 0 : a.score || 0,
      formatDate(a.appliedDate)
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "data_pelamar.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-3">
      <div className="flex gap-2 w-full md:w-auto">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input 
            type="text" placeholder="Cari pelamar..." 
            className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg w-full text-sm focus:outline-none focus:ring-1 focus:ring-sky-500/30"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Listbox Status & Posisi */}
        {[ 
          { val: filterStatus, set: setFilterStatus, opt: statusOptions },
          { val: filterPosisi, set: setFilterPosisi, opt: jobPositions }
        ].map((item, i) => (
          <Listbox key={i} value={item.val} onChange={item.set}>
            <div className="relative w-44">
              <Listbox.Button className="flex justify-between items-center w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-1 focus:ring-sky-500/30">
                <span className="truncate">{item.val.label}</span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Listbox.Button>
              <Transition as={Fragment} leave="transition duration-100 opacity-0">
                <Listbox.Options className="absolute mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
                  {item.opt.map((o) => (
                    <Listbox.Option key={o.value} value={o} className={({ active }) => `px-3 py-2 cursor-pointer text-sm flex items-center gap-2 ${active ? "bg-sky-100 text-sky-700" : "text-gray-700"}`}>
                      {({ selected }) => <>{selected && <Check className="h-4 w-4" />}{o.label}</>}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        ))}
      </div>
      <button onClick={handleExport} className="px-4 py-2 flex items-center gap-2 border rounded-lg text-white bg-sky-600 hover:bg-sky-700 transition-colors">
        <FileSpreadsheet className="h-4 w-4" /> Export Excel
      </button>
    </div>
  );
};

export default FilterBar;