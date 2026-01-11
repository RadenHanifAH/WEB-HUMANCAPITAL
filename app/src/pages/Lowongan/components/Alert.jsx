import React, { useEffect } from "react";
import { X, CheckCircle, AlertTriangle, Info } from "lucide-react";

const iconMap = {
  success: CheckCircle,
  error: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
};

const leftBarMap = {
  success: "bg-green-500",
  error: "bg-red-500",
  warning: "bg-yellow-500",
  info: "bg-blue-500",
};

export default function ToastAlert({
  open,
  type = "info",
  title = "",
  message = "",
  onClose,
  duration = 2500, // auto close
}) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  if (!open) return null;

  const Icon = iconMap[type] || Info;

  return (
    <div className="fixed z-[9999] top-6 right-6 px-4 w-full sm:w-auto">
      <div className="relative w-full sm:w-[420px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Left accent bar */}
        <div className={`absolute left-0 top-0 h-full w-1.5 ${leftBarMap[type] || "bg-blue-500"}`} />

        <div className="p-5 pl-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <Icon
                className={`w-6 h-6 ${
                  type === "success"
                    ? "text-green-600"
                    : type === "error"
                    ? "text-red-600"
                    : type === "warning"
                    ? "text-yellow-600"
                    : "text-blue-600"
                }`}
              />
            </div>

            <div className="flex-1">
              {title ? (
                <p className="text-sm font-semibold text-gray-900 leading-5">
                  {title}
                </p>
              ) : null}

              {message ? (
                <p className="text-sm text-gray-600 mt-1 leading-5">
                  {message}
                </p>
              ) : null}
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-100 text-gray-500"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
