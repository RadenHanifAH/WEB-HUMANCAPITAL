import React from "react";
import { Check, AlertTriangle, XCircle } from "lucide-react";

const ToastNotification = ({ message, type, onClose }) => {
  if (!message) return null;

  const baseClasses =
    "fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl flex items-start space-x-3 max-w-sm transition-all transform duration-300 ease-out";

  let icon, colorClasses, title;

  if (type === "success") {
    icon = <Check size={20} className="text-green-600" />;
    colorClasses = "bg-white border-l-4 border-green-500";
    title = "Sukses!";
  } else if (type === "error") {
    icon = <AlertTriangle size={20} className="text-red-600" />;
    colorClasses = "bg-white border-l-4 border-red-500";
    title = "Kesalahan!";
  } else {
    return null;
  }

  return (
    <div className={`${baseClasses} ${colorClasses} opacity-100 translate-y-0`}>
      <div className="mt-0.5">{icon}</div>

      <div className="flex-1">
        <p className="text-sm font-bold text-gray-900">{title}</p>
        {message.map((msg, index) => (
          <p key={index} className="text-sm text-gray-700 mt-1">
            {msg}
          </p>
        ))}
      </div>

      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-100"
        aria-label="Tutup notifikasi"
      >
        <XCircle size={16} />
      </button>
    </div>
  );
};

export default ToastNotification;
