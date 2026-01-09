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
        setApplicants(res.items || []);
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
  }, [open]);

  const submit = async (e) => {
    e.preventDefault();
    if (
      !form.applicant ||
      !form.type ||
      !form.date ||
      !form.time ||
      !form.location
    ) {
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
          <h2 className="text-lg font-bold">Jadwalkan Interview Baru</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-500 hover:text-sky-800" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Buat jadwal interview berdasarkan Application
        </p>

        <form onSubmit={submit} className="space-y-4">
          {/* Kandidat dari Application */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Kandidat <span className="text-red-500">*</span>
            </label>

            <Listbox
              value={form.applicant}
              onChange={(val) => setForm({ ...form, applicant: val })}
            >
              {({ open: ddOpen }) => (
                <div className="relative mt-1">
                  <Listbox.Button className="w-full flex justify-between items-center px-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm text-left text-sm focus:outline-none focus:ring-1 focus:ring-sky-500/30">
                    <span className="block truncate">
                      {form.applicant
                        ? `${form.applicant.applicantName} — ${form.applicant.position}`
                        : loadingApplicants
                        ? "Loading kandidat..."
                        : "Pilih kandidat (Application)"}
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
                      {applicants.map((a) => (
                        <Listbox.Option key={a.applicationId} value={a}>
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
                                {a.applicantName} — {a.position}
                              </span>
                              <span className="block truncate text-xs text-gray-500">
                                {a.applicantEmail}
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

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tipe Interview <span className="text-red-500">*</span>
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
                placeholder="Meeting Room atau Video Call"
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
