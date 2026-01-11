import React from "react";
import { Trash2 } from "lucide-react";

function formatDateTime(isoString) {
  if (!isoString) return "-";
  const date = new Date(isoString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${day}/${month}/${year}, ${hours}:${minutes}`;
}

function getStatusClasses(status) {
  switch (status) {
    case "queued":
      return "bg-yellow-100 text-yellow-700";
    case "sent":
      return "bg-green-100 text-green-700";
    case "failed":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getStatusText(status) {
  switch (status) {
    case "queued":
      return "Antri";
    case "sent":
      return "Terkirim";
    case "failed":
      return "Gagal";
    default:
      return "Status";
  }
}

export default function MessageCard({ msg, onDelete }) {
  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white border-gray-200">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold">
          {(msg.recipientName || msg.recipientEmail || "?")
            .slice(0, 1)
            .toUpperCase()}
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start mb-2 gap-3">
            <div>
              <h4 className="font-semibold text-lg">
                {msg.recipientName || msg.recipientEmail}
              </h4>
              <p className="text-sm text-gray-500">{msg.recipientEmail}</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusClasses(
                    msg.status
                  )}`}
                >
                  {getStatusText(msg.status)}
                </span>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {formatDateTime(msg.createdAt)}
                </span>
              </div>

              {/* ✅ icon hapus per pesan */}
              <button
                onClick={() => onDelete?.(msg)}
                className="p-2 rounded-lg border bg-white text-gray-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition"
                title="Hapus pesan"
                type="button"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <h5 className="font-semibold mb-1">{msg.subject}</h5>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{msg.body}</p>

        </div>
      </div>
    </div>
  );
}
