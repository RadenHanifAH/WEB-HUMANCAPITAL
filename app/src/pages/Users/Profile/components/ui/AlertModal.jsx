import React from "react";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

export default function AlertModal({
  open,
  type = "error",
  title,
  message,
  onClose,
}) {
  if (!open) return null;

  const styles = {
    success: {
      icon: <CheckCircle size={56} className="text-green-500" />,
      button: "bg-green-600 hover:bg-green-700",
    },
    warning: {
      icon: <AlertTriangle size={56} className="text-yellow-500" />,
      button: "bg-yellow-500 hover:bg-yellow-600",
    },
    error: {
      icon: <XCircle size={56} className="text-red-500" />,
      button: "bg-red-600 hover:bg-red-700",
    },
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          {styles[type].icon}

          <h2 className="mt-4 text-xl font-bold text-gray-900">{title}</h2>

          <p className="mt-2 text-sm text-gray-600">{message}</p>

          <button
            onClick={onClose}
            className={`mt-6 w-full rounded-lg py-3 text-sm font-semibold text-white transition ${styles[type].button}`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
