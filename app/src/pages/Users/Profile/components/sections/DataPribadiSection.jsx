import React from "react";
import { Edit, Save, Calendar as CalendarIcon } from "lucide-react";
import SettingsInput from "../SettingsInput";
import { toDateInputFormat, toDisplayFormat } from "../../utils/profileHelpers";

const DataPribadiSection = ({
  editedData,
  setEditedData,
  isEditable,
  onEdit,
  onCancel,
  onSave,
  onChange,
  dateInputRef,
}) => {
  const {
    name,
    email,
    profile: {
      fullName,
      NIK,
      gender,
      nomorHp,
      tempatLahir,
      tanggalLahir,
      alamat,
      about,
    } = {},
  } = editedData;

  const displayData = (data) => (data && data !== "" ? toDisplayFormat(data) : "Data belum diisi");
  const dataClass = (data) => (data && data !== "" ? "text-gray-900 font-medium" : "text-gray-500 italic");

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Data Pribadi</h3>
          <p className="text-sm text-gray-500 mt-1 mb-6">
            Pastikan data pribadi benar untuk mempermudah proses pendaftaran
          </p>
        </div>

        {isEditable ? (
          <div className="flex space-x-2">
            <button
              onClick={onCancel}
              className="flex items-center text-gray-600 hover:text-red-600 transition p-2 rounded-lg hover:bg-red-50 border border-gray-300"
              aria-label="Batalkan Edit"
            >
              Batalkan
            </button>

            <button
              onClick={onSave}
              className="flex items-center px-4 py-2 text-white font-semibold rounded-lg shadow-md bg-blue-600 hover:bg-blue-700 transition"
              aria-label="Simpan Data"
            >
              <Save size={20} className="mr-2" /> Simpan
            </button>
          </div>
        ) : (
          <button
            className="text-sky-600 hover:text-blue-800 transition p-2 rounded-full hover:bg-sky-50"
            aria-label="Edit Data"
            onClick={onEdit}
          >
            <Edit size={20} />
          </button>
        )}
      </div>

      <h4 className="text-lg font-bold text-gray-900 mt-6 mb-4">Biodata</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 text-gray-700">
        {/* Nama Lengkap */}
        <div className="col-span-1 md:col-span-2">
          <SettingsInput
            id="fullName"
            label="Nama Lengkap"
            value={fullName || name || ""}
            onChange={onChange}
            editable={isEditable}
            readOnly={!isEditable}
          />
        </div>

        {/* NIK */}
        <div>
          <SettingsInput
            id="NIK"
            label="NIK"
            value={NIK || ""}
            onChange={onChange}
            editable={isEditable}
            readOnly={!isEditable}
          />
        </div>

        {/* Jenis Kelamin */}
        <div>
          <SettingsInput
            id="gender"
            label="Jenis Kelamin"
            value={gender || ""}
            onChange={onChange}
            editable={isEditable}
            readOnly={!isEditable}
          />
        </div>

        {/* Tempat Lahir */}
        <div>
          <SettingsInput
            id="tempatLahir"
            label="Tempat Lahir"
            value={tempatLahir || ""}
            onChange={onChange}
            editable={isEditable}
            readOnly={!isEditable}
          />
        </div>

        {/* Tanggal Lahir */}
        <div className="relative">
          {isEditable ? (
            <>
              <SettingsInput
                id="tanggalLahir"
                label="Tanggal Lahir"
                value={toDisplayFormat(tanggalLahir)}
                onChange={(e) => {
                  const val = e.target.value;
                  const parts = val.split("-");
                  if (parts.length === 3) {
                    const [dd, mm, yyyy] = parts;
                    if (dd.length === 2 && mm.length === 2 && yyyy.length === 4) {
                      setEditedData((prev) => ({
                        ...prev,
                        profile: { ...prev.profile, tanggalLahir: `${yyyy}-${mm}-${dd}` },
                      }));
                      return;
                    }
                  }

                  setEditedData((prev) => ({
                    ...prev,
                    profile: { ...prev.profile, tanggalLahir: val },
                  }));
                }}
                editable={isEditable}
                readOnly={!isEditable}
                type="text"
                showDateIcon={true}
                dateInputRef={dateInputRef}
              />

              <input
                ref={dateInputRef}
                type="date"
                className="absolute opacity-0 w-0 h-0 p-0 m-0"
                value={toDateInputFormat(tanggalLahir)}
                onChange={(e) => {
                  const internalFormat = e.target.value;
                  setEditedData((prev) => ({
                    ...prev,
                    profile: { ...prev.profile, tanggalLahir: internalFormat },
                  }));
                }}
              />
            </>
          ) : (
            <div className="mb-4">
              <p className="text-base font-bold text-gray-800 mb-1">Tanggal Lahir</p>
              <div className="px-4 py-3 rounded-lg border border-gray-200 bg-gray-100 text-gray-800">
                <p className={dataClass(tanggalLahir)}>{displayData(tanggalLahir)}</p>
              </div>
            </div>
          )}
        </div>

        {/* No Handphone */}
        <div>
          <SettingsInput
            id="nomorHp"
            label="No Handphone"
            value={nomorHp || ""}
            onChange={onChange}
            editable={isEditable}
            readOnly={!isEditable}
            type="tel"
          />
        </div>

        {/* Email */}
        <div>
          <div className="mb-4">
            <p className="text-base font-bold text-gray-800 mb-1">Email</p>
            <div className="px-4 py-3 rounded-lg border border-gray-200 bg-gray-100 text-gray-800">
              <p className={dataClass(email)}>{email || "Data belum diisi"}</p>
            </div>
          </div>
        </div>

        {/* Alamat */}
        <div className="col-span-1 md:col-span-2">
          <SettingsInput
            id="alamat"
            label="Alamat Lengkap"
            value={alamat || ""}
            onChange={onChange}
            editable={isEditable}
            readOnly={!isEditable}
            isTextArea={true}
          />
        </div>

        {/* About Me */}
        <div className="col-span-1 md:col-span-2">
          <SettingsInput
            id="about"
            label="Tentang Saya (About Me)"
            value={about || ""}
            onChange={onChange}
            editable={isEditable}
            readOnly={!isEditable}
            isTextArea={true}
          />
        </div>
      </div>
    </div>
  );
};

export default DataPribadiSection;
