import React, { Fragment } from "react";
import { toast } from "react-hot-toast";
import { Search, ChevronDown, Check, FileSpreadsheet } from "lucide-react";
import { Listbox, Transition } from "@headlessui/react";
import { statusOptions } from "../utils/constants";
import { formatDate } from "../utils/helpers";

const FilterBar = ({
  search,
  setSearch,
  filterStatus,
  setFilterStatus,
  filterPosisi,
  setFilterPosisi,
  jobPositions,
  filteredApplicants,
  loading,
}) => {
  const normalizeExportStatus = (raw) => {
    const s = String(raw || "").trim();
    const low = s.toLowerCase();
    if (low.startsWith("rejected-at-")) {
      const stage = low.replace("rejected-at-", "").replace(/-/g, " ");
      return `Rejected (at ${stage})`;
    }
    return s || "-";
  };

  // ✅ EXPORT EXCEL REAL-TIME (tanpa CV & Portofolio)
  const handleExportExcel = async () => {
    try {
      if (loading) return toast.error("Masih memuat data, tunggu sebentar.");
      if (!filteredApplicants || filteredApplicants.length === 0)
        return toast.error("Data kosong, tidak ada yang bisa di-export.");

      const XLSX = await import("xlsx/xlsx.mjs"); // ✅ dynamic import (Vite aman)

      const rows = filteredApplicants.map((a, i) => ({
        No: i + 1,
        "Nama Pelamar": a.name || "-",
        Email: a.email || "-",
        Posisi: a.position || "-",
        Status: normalizeExportStatus(a.status),
        Stage: a.stage || "-",
        Score: a.score ?? "",
        "Tanggal Lamar": formatDate(a.appliedDate),
      }));

      const ws = XLSX.utils.json_to_sheet(rows);

      // ✅ auto width kolom
      const colWidths = Object.keys(rows[0]).map((k) => {
        const maxLen = Math.max(
          k.length,
          ...rows.map((r) => String(r[k] ?? "").length)
        );
        return { wch: Math.min(Math.max(maxLen + 2, 10), 45) };
      });
      ws["!cols"] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Pelamar");

      const now = new Date();
      const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(now.getDate()).padStart(2, "0")}_${String(
        now.getHours()
      ).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;

      XLSX.writeFile(wb, `pelamar_realtime_${stamp}.xlsx`);
      toast.success("Berhasil export Excel!");
    } catch (e) {
      console.error("EXPORT EXCEL ERROR:", e);
      toast.error("Gagal export Excel.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-3">
      {/* LEFT: SEARCH + FILTER */}
      <div className="flex gap-2 w-full md:w-auto">
        {/* SEARCH */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Cari pelamar..."
            className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg w-full text-sm focus:outline-none focus:ring-1 focus:ring-sky-500/30"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* FILTER STATUS */}
        <Listbox value={filterStatus} onChange={setFilterStatus}>
          <div className="relative w-44">
            <Listbox.Button className="flex justify-between items-center w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-1 focus:ring-sky-500/30">
              <span className="truncate">{filterStatus?.label || "Status"}</span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </Listbox.Button>

            <Transition as={Fragment} leave="transition duration-100 opacity-0">
              <Listbox.Options className="absolute mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
                {statusOptions.map((o) => (
                  <Listbox.Option
                    key={o.value}
                    value={o}
                    className={({ active }) =>
                      `px-3 py-2 cursor-pointer text-sm flex items-center gap-2 ${
                        active ? "bg-sky-100 text-sky-700" : "text-gray-700"
                      }`
                    }
                  >
                    {({ selected }) => (
                      <>
                        {selected && <Check className="h-4 w-4" />}
                        {o.label}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>

        {/* FILTER POSISI */}
        <Listbox value={filterPosisi} onChange={setFilterPosisi}>
          <div className="relative w-44">
            <Listbox.Button className="flex justify-between items-center w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-1 focus:ring-sky-500/30">
              <span className="truncate">{filterPosisi?.label || "Posisi"}</span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </Listbox.Button>

            <Transition as={Fragment} leave="transition duration-100 opacity-0">
              <Listbox.Options className="absolute mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
                {(jobPositions || []).map((o) => (
                  <Listbox.Option
                    key={o.value}
                    value={o}
                    className={({ active }) =>
                      `px-3 py-2 cursor-pointer text-sm flex items-center gap-2 ${
                        active ? "bg-sky-100 text-sky-700" : "text-gray-700"
                      }`
                    }
                  >
                    {({ selected }) => (
                      <>
                        {selected && <Check className="h-4 w-4" />}
                        {o.label}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
      </div>

      {/* RIGHT: EXPORT */}
      <button
        onClick={handleExportExcel}
        disabled={loading}
        className="px-4 py-2 flex items-center gap-2 rounded-lg text-white bg-sky-600 hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FileSpreadsheet className="h-4 w-4" />
        Export Excel
      </button>
    </div>
  );
};

export default FilterBar;
