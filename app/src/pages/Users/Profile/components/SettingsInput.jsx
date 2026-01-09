import React from "react";
import { Eye, EyeOff, Calendar } from "lucide-react";

const SettingsInput = ({
  label,
  value,
  type = "text",
  readOnly = true,
  onChange,
  editable = false,
  customType = null,
  showToggle = false,
  onToggleVisibility,
  isPasswordVisible = false,
  id,
  isTextArea = false,
  showDateIcon = false,
  dateInputRef = null,
}) => {
  const inputType =
    customType === "password"
      ? isPasswordVisible
        ? "text"
        : "password"
      : customType || type;

  const InputComponent = isTextArea ? "textarea" : "input";
  const paddingClass = showToggle || showDateIcon ? "pr-10" : "pr-4";

  return (
    <div className="mb-4">
      <p className="text-base font-bold text-gray-800 mb-1">{label}</p>

      <div className="flex items-center gap-2 relative">
        <InputComponent
          id={id}
          type={!isTextArea ? inputType : undefined}
          value={value}
          readOnly={readOnly && !editable}
          onChange={onChange}
          rows={isTextArea ? 3 : undefined}
          className={`flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500 border transition-all ${
            editable ? "bg-white border-sky-400" : "bg-gray-100 border-gray-200"
          } ${isTextArea ? "resize-none" : ""} ${paddingClass}`}
        />

        {showToggle && (
          <button
            type="button"
            onClick={onToggleVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-sky-600 transition p-1 z-10"
            aria-label={isPasswordVisible ? "Sembunyikan password" : "Lihat password"}
          >
            {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}

        {showDateIcon && editable && (
          <button
            type="button"
            onClick={() => dateInputRef?.current && dateInputRef.current.showPicker?.()}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-sky-600 transition p-1 z-10"
            aria-label="Pilih tanggal"
          >
            <Calendar size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SettingsInput;
