"use client";
import React, { useState, useEffect } from "react";
import { X, ChevronDown, Check } from "lucide-react";
import { Listbox } from "@headlessui/react";

export default function Create({ isOpen, onClose, onSave, initialData }) {
  const departemenOptions = ["IT", "HRD", "Finance"];
  const tipeOptions = ["Fulltime", "Parttime", "Internship"];
  const statusOptions = ["active", "draft", "closed"];

  const [formData, setFormData] = useState({
    judulPosisi: "",
    departemen: "",
    lokasi: "",
    tipePekerjaan: "",
    gajiMinimum: "",
    gajiMaksimum: "",
    deadline: "",
    deskripsi: "",
    persyaratan: "",
    status: "active",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        judulPosisi: initialData.title || "",
        departemen: initialData.department || "",
        lokasi: initialData.location || "",
        tipePekerjaan: initialData.type || "",
        gajiMinimum: initialData.gajiMinimum || "",
        gajiMaksimum: initialData.gajiMaksimum || "",
        deadline: initialData.deadline || "",
        deskripsi: initialData.description || "",
        persyaratan: initialData.requirements || "",
        status: initialData.status || "active",
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) onSave(formData);
    onClose();
  };

  const renderListbox = (label, name, options) => (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <Listbox
        value={formData[name]}
        onChange={(val) => setFormData((prev) => ({ ...prev, [name]: val }))}
      >
        {({ open }) => (
          <div className="relative mt-1">
            <Listbox.Button className="w-full flex justify-between items-center px-3 py-2 border border-gray-200 rounded-lg bg-white shadow-sm text-left text-sm focus:outline-none focus:ring-2 focus:ring-sky-700">
              <span>{formData[name] || `Pilih ${label}`}</span>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 ml-1 transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </Listbox.Button>
            <Listbox.Options className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 text-sm">
              {options.map((opt, i) => (
                <Listbox.Option key={i} value={opt}>
                  {({ active, selected }) => (
                    <div
                      className={`flex justify-between items-center px-3 py-2 cursor-pointer rounded-md ${
                        active ? "bg-sky-100 text-sky-700" : "text-gray-700"
                      }`}
                    >
                      <span>{opt}</span>
                      {selected && <Check className="w-4 h-4 text-sky-600" />}
                    </div>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        )}
      </Listbox>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">
            {initialData ? "Edit Lowongan" : "Buat Lowongan Baru"}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <p className="text-gray-500 text-sm">
            Isi informasi lowongan pekerjaan
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Judul Posisi</label>
              <input
                type="text"
                name="judulPosisi"
                value={formData.judulPosisi}
                onChange={handleChange}
                placeholder="Frontend Developer"
                className="w-full border border-gray-200 rounded-lg p-2"
              />
            </div>
            {renderListbox("Departemen", "departemen", departemenOptions)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Lokasi</label>
              <input
                type="text"
                name="lokasi"
                value={formData.lokasi}
                onChange={handleChange}
                placeholder="Jakarta"
                className="w-full border border-gray-200 rounded-lg p-2"
              />
            </div>
            {renderListbox("Tipe Pekerjaan", "tipePekerjaan", tipeOptions)}
          </div>

          {renderListbox("Status Lowongan", "status", statusOptions)}

          <div>
            <label className="text-sm font-medium">Deadline Lamaran</label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg p-2"
            />
          </div>

          {/* Deskripsi & Persyaratan */}
          {["deskripsi", "persyaratan"].map((field) => (
            <div key={field}>
              <label className="text-sm font-medium">
                {field === "deskripsi"
                  ? "Deskripsi Pekerjaan"
                  : "Persyaratan"}
              </label>
              <textarea
                name={field}
                value={formData[field]}
                onChange={handleChange}
                placeholder={`Isi ${field}...`}
                className="w-full border border-gray-200 rounded-lg p-2"
                rows="3"
              />
            </div>
          ))}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded text-gray-600"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 text-white rounded"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
