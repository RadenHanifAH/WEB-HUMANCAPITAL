import React, { useEffect, useRef } from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";

/**
 * ConfirmDialog
 * Drop-in replacement for window.confirm(), styled to match the app.
 *
 * Usage:
 *   const [confirmState, setConfirmState] = useState({ open: false });
 *
 *   setConfirmState({
 *     open: true,
 *     title: "Hapus jadwal ini?",
 *     description: "Tindakan ini tidak dapat dibatalkan.",
 *     confirmLabel: "Hapus",
 *     variant: "danger", // "danger" | "default"
 *     onConfirm: () => doDelete(id),
 *   });
 *
 *   <ConfirmDialog
 *     open={confirmState.open}
 *     title={confirmState.title}
 *     description={confirmState.description}
 *     confirmLabel={confirmState.confirmLabel}
 *     variant={confirmState.variant}
 *     onConfirm={() => {
 *       confirmState.onConfirm?.();
 *       setConfirmState({ open: false });
 *     }}
 *     onCancel={() => setConfirmState({ open: false })}
 *   />
 */
export default function ConfirmDialog({
  open,
  title = "Apakah Anda yakin?",
  description = "",
  confirmLabel = "Ya, lanjutkan",
  cancelLabel = "Batal",
  variant = "default", // "default" | "danger"
  loading = false,
  onConfirm,
  onCancel,
}) {
  const panelRef = useRef(null);

  // Handle Escape key & Body Scroll Lock
  useEffect(() => {
    if (!open) return;

    const handleKey = (e) => {
      if (e.key === "Escape" && !loading) onCancel?.();
    };
    
    // Lock body scroll
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);

    // Focus the panel when opened
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, onCancel, loading]);

  if (!open) return null;

  const isDanger = variant === "danger";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
        onClick={() => !loading && onCancel?.()}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl shadow-slate-900/20 ring-1 ring-black/5 animate-[popIn_0.18s_cubic-bezier(0.16,1,0.3,1)] outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => !loading && onCancel?.()}
          className="absolute right-3 top-3 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          aria-label="Tutup"
          disabled={loading}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-6 pt-7 pb-6 text-center">
          <div
            className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
              isDanger
                ? "bg-red-50 text-red-600"
                : "bg-sky-50 text-sky-700"
            }`}
          >
            <AlertTriangle className="h-6 w-6" strokeWidth={2} />
          </div>

          <h2
            id="confirm-dialog-title"
            className="text-base font-semibold text-slate-900"
          >
            {title}
          </h2>

          {description ? (
            <p
              id="confirm-dialog-description"
              className="mt-2 text-sm text-slate-500 leading-relaxed"
            >
              {description}
            </p>
          ) : null}
        </div>

        <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed ${
              isDanger
                ? "bg-gradient-to-tr from-red-600 to-red-500 shadow-red-400/40 hover:from-red-700 hover:to-red-600 focus-visible:ring-red-500"
                : "bg-gradient-to-tr from-sky-700 to-sky-600 shadow-sky-400/40 hover:from-sky-800 hover:to-sky-600 focus-visible:ring-sky-500"
            }`}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Memproses..." : confirmLabel}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95) translateY(4px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}