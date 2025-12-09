"use client";
import React, { useState, useEffect } from "react";
import { X, ChevronDown, Check } from "lucide-react";
import { Listbox } from "@headlessui/react";

function Create({ isOpen, onClose, onSave, initialData }) {
  const tipeOptions = ["FullTime", "PartTime", "Internship", "Freelance", "Contract"];
  const statusOptions = ["active", "draft", "closed"];

  // State
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
    if (isOpen) {
      if (initialData) {
        // MODE EDIT
        setFormData({
          judulPosisi: initialData.title || initialData.judulPosisi || "",
          departemen: initialData.department || initialData.departemen || "",
          lokasi: initialData.location || initialData.lokasi || "",
          tipePekerjaan: initialData.type || initialData.tipePekerjaan || "",
          deadline: initialData.deadline ? initialData.deadline.split('T')[0] : "",
          deskripsi: initialData.description || initialData.deskripsi || "",
          persyaratan: initialData.requirements || initialData.persyaratan || "",
          status: initialData.status || "active",
        });
      } else {
        // MODE CREATE
        setFormData({
          judulPosisi: "",
          departemen: "",
          lokasi: "",
          tipePekerjaan: "",
          deadline: "",
          deskripsi: "",
          persyaratan: "",
          status: "active",
        });
      }
      setValidationErrors({});
    }
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
    if (!validateForm()) return;

    const payload = {
        title: formData.judulPosisi,
        department: formData.departemen,
        location: formData.lokasi,
        type: formData.tipePekerjaan,
        deadline: formData.deadline,
        description: formData.deskripsi,
        requirements: formData.persyaratan,
        status: formData.status
    };

    if (onSave) onSave(payload);
  };

  // --- BAGIAN YANG DIPERBAIKI (RENDER LISTBOX) ---
  const renderListbox = (label, name, options) => {
    const isRequired = ["Tipe Pekerjaan"].includes(label);

    return (
      <div className="w-full">
        <label className="text-sm font-medium mb-1 block">
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <Listbox
          value={formData[name]}
          onChange={(val) => handleListboxChange(name, val)}
          as="div"
          className="relative mt-1" 
        >
          {({ open }) => (
            <>
              {/* BUTTON: 
                  - Menghapus 'focus:ring-1 focus:ring-sky-500/30' agar tidak ada efek tebal/geser.
                  - Menambahkan 'focus:border-sky-500' agar hanya warnanya yang berubah, ukurannya tetap.
              */}
              <Listbox.Button 
                className={`w-full flex justify-between items-center px-3 py-2 border rounded-lg bg-white shadow-sm text-left text-sm 
                focus:outline-none focus:border-sky-500 transition-colors duration-200 
                ${validationErrors[name] ? "border-red-500" : "border-gray-200"}`}
              >
                <span className={`block truncate ${!formData[name] ? "text-gray-400" : "text-gray-900"}`}>
                    {formData[name] || `Pilih ${label}`}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 ml-1 transition-transform duration-200 flex-shrink-0 ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </Listbox.Button>

              {validationErrors[name] && (
                  <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-0">{validationErrors[name]}</p>
              )}
  
              {/* OPTIONS: 
                  - Menghapus 'ring-1 ring-black ring-opacity-5' untuk menghilangkan garis border tambahan.
                  - Hanya menggunakan shadow-xl dan border halus.
              */}
              <Listbox.Options className="absolute mt-1 w-full max-h-60 overflow-auto bg-white border border-gray-100 rounded-lg shadow-xl z-50 text-sm py-1 focus:outline-none">
                {options.map((opt, i) => (
                  <Listbox.Option key={i} value={opt} className="outline-none">
                    {({ active, selected }) => (
                      <div
                        className={`flex justify-between items-center px-3 py-2 cursor-pointer transition-colors ${
                          active ? "bg-sky-50 text-sky-700" : "text-gray-700"
                        }`}
                      >
                        <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                            {opt}
                        </span>
                        {selected && <Check className="w-4 h-4 text-sky-600 flex-shrink-0" />}
                      </div>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </>
          )}
        </Listbox>
        
        {validationErrors[name] && <div className="h-4"></div>}
      </div>
    );
  };

  const inputClass =
    "w-full border rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-sky-500/30 text-sm mt-1"; 

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-800">
            {initialData ? "Edit Lowongan" : "Buat Lowongan Baru"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable Form Area */}
        <div className="overflow-y-auto p-6">
            <form id="createJobForm" onSubmit={handleSubmit} className="space-y-6" noValidate>
            <p className="text-gray-500 text-sm mb-2">
                Silakan lengkapi form di bawah ini untuk mempublikasikan lowongan.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-sm font-medium block mb-1">
                        Judul Posisi <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="judulPosisi"
                        value={formData.judulPosisi}
                        onChange={handleChange}
                        placeholder="Contoh: Frontend Developer"
                        className={`${inputClass} ${validationErrors.judulPosisi ? "border-red-500" : "border-gray-200"}`}
                    />
                    {validationErrors.judulPosisi && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.judulPosisi}</p>
                    )}
                </div>

                <div>
                    <label className="text-sm font-medium block mb-1">
                        Departemen <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="departemen"
                        value={formData.departemen}
                        onChange={handleChange}
                        placeholder="Contoh: IT, Finance, HRD"
                        className={`${inputClass} ${validationErrors.departemen ? "border-red-500" : "border-gray-200"}`}
                    />
                    {validationErrors.departemen && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.departemen}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-sm font-medium block mb-1">
                        Lokasi <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="lokasi"
                        value={formData.lokasi}
                        onChange={handleChange}
                        placeholder="Contoh: Jakarta"
                        className={`${inputClass} ${validationErrors.lokasi ? "border-red-500" : "border-gray-200"}`}
                    />
                    {validationErrors.lokasi && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.lokasi}</p>
                    )}
                </div>
                {renderListbox("Tipe Pekerjaan", "tipePekerjaan", tipeOptions)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {renderListbox("Status Lowongan", "status", statusOptions)}
                
                <div>
                    <label className="text-sm font-medium block mb-1">
                    Deadline Lamaran <span className="text-red-500">*</span>
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
            </div>

            {/* Deskripsi & Persyaratan */}
            {["deskripsi", "persyaratan"].map((field) => (
                <div key={field}>
                <label className="text-sm font-medium capitalize block mb-1">
                    {field === "deskripsi" ? "Deskripsi Pekerjaan" : "Persyaratan Kualifikasi"}
                    <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    placeholder={`Isi detail ${field}...`}
                    className={`${inputClass} min-h-[100px] ${validationErrors[field] ? "border-red-500" : "border-gray-200"}`} 
                />
                {validationErrors[field] && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors[field]}</p>
                )}
                </div>
            ))}
            </form>
        </div>
        
        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 flex-shrink-0">
            <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-100 transition font-medium"
            >
                Batal
            </button>
            <button
                type="submit"
                form="createJobForm"
                className="px-5 py-2.5 rounded-lg text-white font-medium bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 shadow-md"
            >
                {initialData ? "Simpan Perubahan" : "Simpan Lowongan"}
            </button>
        </div>
      </div>
    </div>
  );
}

export default Create;