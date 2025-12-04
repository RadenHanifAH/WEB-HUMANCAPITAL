"use client";
import React, { useState, useEffect } from "react";
import { X, ChevronDown, Check } from "lucide-react";
import { Listbox } from "@headlessui/react";

function Create({ isOpen, onClose, onSave, initialData }) {
  const departemenOptions = ["IT", "HRD", "Finance"];
  const tipeOptions = ["FullTime", "PartTime", "Internship", "Freelance", "Contract"];
  const statusOptions = ["active", "draft", "closed"];

  const [formData, setFormData] = useState({
    judulPosisi: "",
    departemen: "",
    lokasi: "",
    tipePekerjaan: "",
    deadline: "",
    deskripsi: "",
    persyaratan: "",
    status: "active",
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        judulPosisi: initialData.title || "",
        departemen: initialData.department || "",
        lokasi: initialData.location || "",
        tipePekerjaan: initialData.type || "",
        deadline: initialData.deadline || "",
        deskripsi: initialData.description || "",
        persyaratan: initialData.requirements || "",
        status: initialData.status || "active",
      });
    }
    setValidationErrors({}); 
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, [name]: null }));
  };
  
  const handleListboxChange = (name, value) => {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setValidationErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const fieldLabels = {
        judulPosisi: "Judul Posisi",
        departemen: "Departemen",
        lokasi: "Lokasi",
        tipePekerjaan: "Tipe Pekerjaan",
        deadline: "Deadline Lamaran",
        deskripsi: "Deskripsi Pekerjaan",
        persyaratan: "Persyaratan",
    };
    
    let errors = {};
    let valid = true;

    Object.keys(fieldLabels).forEach(field => {
      if (!formData[field]) {
        valid = false;
        errors[field] = `${fieldLabels[field]} wajib diisi.`;
      }
    });

    setValidationErrors(errors);
    return valid;
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
        // Notifikasi error tetap muncul di bawah field yang kosong
        return;
    }

    if (onSave) onSave(formData);
    onClose();
  };

  const renderListbox = (label, name, options) => {
    const isRequired = ["Departemen", "Tipe Pekerjaan"].includes(label);

    return (
      <div>
        <label className="text-sm font-medium">
          {label}
          {/* Tanda bintang untuk wajib diisi */}
          {isRequired && <span className="text-red-500">*</span>}
        </label>
        <Listbox
          value={formData[name]}
          onChange={(val) => handleListboxChange(name, val)}
        >
          {({ open }) => (
            <div className="relative mt-1">
              <Listbox.Button 
                className={`w-full flex justify-between items-center px-3 py-2 border rounded-lg bg-white shadow-sm text-left text-sm focus:outline-none focus:ring-1 focus:ring-sky-500/30 ${
                  validationErrors[name] ? "border-red-500" : "border-gray-200"
                }`}
              >
                <span>{formData[name] || `Pilih ${label}`}</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 ml-1 transition-transform duration-200 ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </Listbox.Button>
              {validationErrors[name] && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors[name]}</p>
              )}
  
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
  };

  // Kelas input yang seragam
  const inputClass =
    "w-full border rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-sky-500/30 text-sm mt-1"; 

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b mx-4">
          <h2 className="text-lg font-semibold">
            {initialData ? "Edit Lowongan" : "Buat Lowongan Baru"}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4" noValidate>
          <p className="text-gray-500 text-sm">
            Isi informasi lowongan pekerjaan
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">
                Judul Posisi
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="judulPosisi"
                value={formData.judulPosisi}
                onChange={handleChange}
                placeholder="Frontend Developer"
                className={`${inputClass} ${validationErrors.judulPosisi ? "border-red-500" : "border-gray-200"}`}
              />
              {validationErrors.judulPosisi && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.judulPosisi}</p>
              )}
            </div>
            {renderListbox("Departemen", "departemen", departemenOptions)} 
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">
                Lokasi
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lokasi"
                value={formData.lokasi}
                onChange={handleChange}
                placeholder="Jakarta"
                className={`${inputClass} ${validationErrors.lokasi ? "border-red-500" : "border-gray-200"}`}
              />
              {validationErrors.lokasi && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.lokasi}</p>
              )}
            </div>
            {renderListbox("Tipe Pekerjaan", "tipePekerjaan", tipeOptions)}
          </div>

          {/* Status Lowongan tidak wajib diisi, jadi tidak ada tanda bintang di sini */}
          {renderListbox("Status Lowongan", "status", statusOptions)}
          
          <div>
            <label className="text-sm font-medium">
              Deadline Lamaran
              <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className={`${inputClass} ${validationErrors.deadline ? "border-red-500" : "border-gray-200"}`}
            />
            {validationErrors.deadline && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.deadline}</p>
            )}
          </div>

          {/* Deskripsi & Persyaratan */}
          {["deskripsi", "persyaratan"].map((field) => (
            <div key={field}>
              <label className="text-sm font-medium">
                {field === "deskripsi" ? "Deskripsi Pekerjaan" : "Persyaratan"}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                name={field}
                value={formData[field]}
                onChange={handleChange}
                placeholder={`Isi ${field}...`}
                className={`${inputClass} h-24 ${validationErrors[field] ? "border-red-500" : "border-gray-200"}`} 
                rows="3"
              />
              {validationErrors[field] && (
                <p className="text-red-500 text-xs mt-1">{validationErrors[field]}</p>
              )}
            </div>
          ))}

          <div className="flex justify-end gap-3 pt-4 mx-1 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 bg-white shadow-sm hover:bg-gray-100 transition focus:outline-none focus:ring-1 focus:ring-sky-500/30"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-center text-white font-md transition shadow-lg shadow-gray-400/50 transform bg-gradient-to-tr from-sky-700 to-sky-600 hover:from-sky-800 hover:to-sky-600"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Create;