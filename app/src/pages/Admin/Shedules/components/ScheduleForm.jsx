import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { X, ChevronDown, Check, Calendar, Clock, MapPin } from "lucide-react";
import { interviewTypes } from "./constants";
import { fetchApplicants, createSchedule } from "../services/schedules.api";
import toast from "react-hot-toast";

export default function ScheduleForm({ open, onClose, onCreated }) {
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [applicants, setApplicants] = useState([]);

  const [form, setForm] = useState({
    applicant: null, // { applicationId, applicantName, applicantEmail, position }
    type: null, // enum value
    date: "",
    time: "",
    location: "",
  });

  // ✅ state untuk autocomplete kandidat
  const [candidateQuery, setCandidateQuery] = useState("");
  const [showCandidateList, setShowCandidateList] = useState(false);

  const typeLabel = useMemo(() => {
    const found = interviewTypes.find((x) => x.value === form.type);
    return found?.label || "Pilih tipe";
  }, [form.type]);

  useEffect(() => {
    if (!open) return;

    (async () => {
      try {
        setLoadingApplicants(true);
        const res = await fetchApplicants();
        const items = res.items || [];
        setApplicants(items);

        // kalau modal dibuka dan sudah ada applicant terpilih, set query textnya
        if (form.applicant) {
          setCandidateQuery(
            `${form.applicant.applicantName} — ${form.applicant.position}`
          );
        } else {
          setCandidateQuery("");
        }
      } catch (e) {
        console.error(e);
        toast.error(
          e?.response?.data?.message ||
            "Gagal memuat kandidat. Pastikan server backend aktif."
        );
      } finally {
        setLoadingApplicants(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ✅ hasil filter kandidat berdasarkan query (nama/email/posisi)
  const filteredApplicants = useMemo(() => {
    const q = String(candidateQuery || "").trim().toLowerCase();
    if (!q) return applicants;

    return applicants.filter((a) => {
      const name = String(a.applicantName || "").toLowerCase();
      const email = String(a.applicantEmail || "").toLowerCase();
      const pos = String(a.position || "").toLowerCase();
      return name.includes(q) || email.includes(q) || pos.includes(q);
    });
  }, [candidateQuery, applicants]);

  const selectApplicant = (a) => {
    setForm((prev) => ({ ...prev, applicant: a }));
    setCandidateQuery(`${a.applicantName} — ${a.position}`);
    setShowCandidateList(false);
  };

  const clearApplicant = () => {
    setForm((prev) => ({ ...prev, applicant: null }));
    setCandidateQuery("");
    setShowCandidateList(false);
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.applicant || !form.type || !form.date || !form.time || !form.location) {
      toast.error("Semua field harus diisi.");
      return;
    }

    try {
      await createSchedule({
        applicationId: form.applicant.applicationId,
        type: form.type,
        date: form.date,
        time: form.time,
        durationMin: 60,
        location: form.location,
      });

      toast.success("Jadwal berhasil dibuat");
      onClose();
      setForm({
        applicant: null,
        type: null,
        date: "",
        time: "",
        location: "",
      });
      setCandidateQuery("");
      setShowCandidateList(false);
      onCreated?.();
    } catch (e2) {
      toast.error(e2?.response?.data?.message || "Gagal membuat jadwal");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">Jadwalkan Interview/Test Baru</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-500 hover:text-sky-800" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Buat jadwal interview/test
        </p>

        <form onSubmit={submit} className="space-y-4">
          {/* ✅ Kandidat Autocomplete (bukan dropdown) */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">
              Kandidat <span className="text-red-500">*</span>
            </label>

            <div className="relative mt-1">
              <input
                type="text"
                value={candidateQuery}
                onChange={(e) => {
                  const v = e.target.value;
                  setCandidateQuery(v);
                  setShowCandidateList(true);

                  // kalau user mengetik ulang, anggap belum memilih kandidat valid
                  setForm((prev) => ({ ...prev, applicant: null }));
                }}
                onFocus={() => setShowCandidateList(true)}
                onBlur={() => {
                  // delay biar klik list kebaca dulu
                  setTimeout(() => setShowCandidateList(false), 150);
                }}
                placeholder={
                  loadingApplicants ? "Loading kandidat..." : "Nama"
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-sky-500/30 pr-10"
              />

              {!!candidateQuery && (
                <button
                  type="button"
                  onClick={clearApplicant}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100"
                  title="Clear"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>

            {showCandidateList && (
              <div className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 text-sm max-h-60 overflow-auto">
                {loadingApplicants ? (
                  <div className="px-3 py-2 text-gray-500">Loading...</div>
                ) : filteredApplicants.length === 0 ? (
                  <div className="px-3 py-2 text-gray-500">
                    Kandidat tidak ditemukan
                  </div>
                ) : (
                  filteredApplicants.map((a) => (
                    <button
                      key={a.applicationId}
                      type="button"
                      onClick={() => selectApplicant(a)}
                      className="w-full text-left px-3 py-2 hover:bg-sky-100"
                    >
                      <div className="font-medium text-gray-900 truncate">
                        {a.applicantName} — {a.position}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {a.applicantEmail}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* ✅ indikator kalau belum memilih kandidat valid */}
            {!form.applicant && candidateQuery.trim() !== "" && (
              <p className="mt-1 text-xs text-amber-600">
                Pilih kandidat dari daftar yang muncul.
              </p>
            )}

            {/* ✅ kalau sudah dipilih tampilkan small info */}
            {form.applicant && (
              <p className="mt-1 text-xs text-green-700">
                Terpilih: {form.applicant.applicantName} ({form.applicant.applicantEmail})
              </p>
            )}
          </div>

          {/* Type (tetap dropdown) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tipe Jadwal <span className="text-red-500">*</span>
            </label>

            <Listbox
              value={form.type}
              onChange={(val) => setForm({ ...form, type: val })}
            >
              {({ open: ddOpen }) => (
                <div className="relative mt-1">
                  <Listbox.Button className="w-full flex justify-between items-center px-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm text-left text-sm focus:outline-none focus:ring-1 focus:ring-sky-500/30">
                    <span className="block truncate">
                      {form.type ? typeLabel : "Pilih tipe"}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 ml-1 transition-transform ${
                        ddOpen ? "rotate-180" : ""
                      }`}
                    />
                  </Listbox.Button>

                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 text-sm max-h-60 overflow-auto">
                      {interviewTypes.map((t) => (
                        <Listbox.Option key={t.value} value={t.value}>
                          {({ active, selected }) => (
                            <div
                              className={`relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                active
                                  ? "bg-sky-100 text-sky-900"
                                  : "text-gray-900"
                              }`}
                            >
                              <span
                                className={`block truncate ${
                                  selected ? "font-medium" : "font-normal"
                                }`}
                              >
                                {t.label}
                              </span>
                              {selected && (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sky-600">
                                  <Check className="h-5 w-5" />
                                </span>
                              )}
                            </div>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              )}
            </Listbox>
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tanggal <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <input
                  type="date"
                  className="border border-gray-300 shadow rounded-lg px-3 py-2 text-sm w-full pl-9 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Waktu <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <input
                  type="time"
                  className="border border-gray-300 shadow rounded-lg px-3 py-2 text-sm w-full pl-9 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Lokasi <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <input
                placeholder="Syaamil Group atau Zoom"
                className="border border-gray-300 shadow rounded-lg px-3 py-2 text-sm w-full pl-9 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-100 text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-white bg-sky-700 hover:bg-sky-800 text-sm"
            >
              Jadwalkan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
