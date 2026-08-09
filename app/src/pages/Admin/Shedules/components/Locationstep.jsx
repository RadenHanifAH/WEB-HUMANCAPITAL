import React, { useState, useMemo } from "react";
import {
  Search,
  MapPin,
  Video,
  CheckCircle2,
  Circle,
  Link as LinkIcon,
} from "lucide-react";
import { OFFICES } from "./LocationData";

export default function LocationStep({ value, onChange, onNext, onBack }) {
  const [search, setSearch] = useState("");

  const {
    meetingMode = "office", // "office" | "online"
    officeId = "",
    onlineLink = "",
  } = value;

  const filteredOffices = useMemo(() => {
    if (!search.trim()) return OFFICES;
    const q = search.toLowerCase();
    return OFFICES.filter(
      (o) => o.name.toLowerCase().includes(q) || o.address.toLowerCase().includes(q)
    );
  }, [search]);

  const patch = (partial) => onChange({ ...value, ...partial });

  const selectOffice = (office) => {
    patch({ officeId: office.id });
  };

  const toggleOnline = () => {
    if (meetingMode === "online") {
      patch({ meetingMode: "office", onlineLink: "" });
    } else {
      patch({ meetingMode: "online", officeId: "" });
    }
  };

  const canProceed =
    meetingMode === "online" ? onlineLink.trim().length > 0 : Boolean(officeId);

  const handleNext = () => {
    if (!canProceed) return;
    onNext();
  };

  return (
    <div className="space-y-4">
      {/* Search kantor */}
      {meetingMode === "office" && (
        <div className="relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kantor atau cabang..."
            className="border border-gray-300 shadow-sm rounded-lg px-3 py-2 text-sm w-full pl-9 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
        </div>
      )}

      {/* Daftar kantor */}
      {meetingMode === "office" && (
        <div className="space-y-2 max-h-60 sm:max-h-72 overflow-y-auto pr-1">
          {filteredOffices.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Kantor tidak ditemukan</p>
          ) : (
            filteredOffices.map((office) => {
              const selected = office.id === officeId;
              return (
                <button
                  type="button"
                  key={office.id}
                  onClick={() => selectOffice(office)}
                  className={`w-full text-left border rounded-lg p-3 transition-colors ${
                    selected
                      ? "border-sky-500 bg-sky-50 ring-1 ring-sky-200"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold tracking-wide text-sky-600">{office.tag}</p>
                      <p className="text-sm font-semibold text-gray-800 break-words">{office.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5 break-words">{office.address}</p>
                    </div>
                    {selected ? (
                      <CheckCircle2 className="h-5 w-5 text-sky-600 flex-shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-300 flex-shrink-0" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}

      {/* Input link online */}
      {meetingMode === "online" && (
        <div className="border border-sky-200 bg-sky-50 rounded-lg p-4">
          <p className="text-sm font-semibold text-sky-800 mb-2 flex items-center gap-1.5">
            <LinkIcon className="h-4 w-4 shrink-0" /> Link Zoom / Google Meet
          </p>
          <input
            value={onlineLink}
            onChange={(e) => patch({ onlineLink: e.target.value })}
            placeholder="https://zoom.us/j/..."
            className="border border-gray-300 shadow-sm rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-sky-500/30"
          />
          <p className="text-xs text-sky-700 mt-2">
            Link ini akan dikirimkan ke email pelamar bersama undangan wawancara.
          </p>
        </div>
      )}

      {/* Toggle opsi daring */}
      <button
        type="button"
        onClick={toggleOnline}
        className={`w-full flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
          meetingMode === "online"
            ? "border-green-200 bg-green-50"
            : "border-gray-200 bg-white hover:bg-gray-50"
        }`}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-gray-700 min-w-0">
          <Video className={`h-4 w-4 shrink-0 ${meetingMode === "online" ? "text-green-600" : "text-gray-400"}`} />
          <span className="truncate">Opsi Pertemuan Daring</span>
          <span className="text-xs text-gray-400 font-normal hidden sm:inline whitespace-nowrap">
            (Zoom / Google Meet)
          </span>
        </span>
        <span
          className={`w-9 h-5 rounded-full relative transition-colors shrink-0 ${
            meetingMode === "online" ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
              meetingMode === "online" ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </span>
      </button>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 text-sm w-full sm:w-auto"
        >
          ← Kembali
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed}
          className="px-4 py-2 rounded-lg text-white bg-sky-600 hover:bg-sky-700 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          Simpan & Lanjutkan →
        </button>
      </div>
    </div>
  );
}