import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

export default function Toast({ message, type = "success", onClose }) {
  if (!message) return null;

  const bg = type === "success" ? "bg-emerald-500" : "bg-red-500";
  const Icon = type === "success" ? CheckCircle : XCircle;

  return (
    <div className={`fixed bottom-6 right-6 p-4 rounded-lg shadow-xl text-white flex items-center gap-3 z-50 ${bg}`}>
      <Icon size={20} />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-4 opacity-75 hover:opacity-100" type="button">
        &times;
      </button>
    </div>
  );
}
