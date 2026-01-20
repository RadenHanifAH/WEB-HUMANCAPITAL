import React, { useEffect, useRef, useState } from "react";
import { X, Send } from "lucide-react";
import toast from "react-hot-toast";

const DEFAULT_FORM = { recipientEmail: "", subject: "", body: "" };

export default function ComposeDialog({ open, onClose, onSend }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [sending, setSending] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setForm(DEFAULT_FORM);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [form.body, open]);

  if (!open) return null;

  const resetAndClose = () => {
    setForm(DEFAULT_FORM);
    onClose?.();
  };

  const submit = () => {
    if (sending) return;

    const recipientEmail = form.recipientEmail?.trim();
    const subject = form.subject?.trim();
    const body = form.body?.trim();

    if (!recipientEmail || !subject || !body) {
      toast.error("Semua kolom wajib diisi!");
      return;
    }

    // ✅ Payload yang dikunci (biar ga berubah saat state reset)
    const payload = { recipientEmail, subject, body };

    // ✅ UI dibuat cepat: langsung tutup dialog
    setSending(true);
    resetAndClose();

    // ✅ toast progres (akan diupdate)
    toast.loading("Pesan diproses & dikirim...", { id: "send-msg" });

    // ✅ Jalankan request di background (tanpa menahan dialog)
    Promise.resolve()
      .then(() => onSend(payload))
      .then((res) => {
        if (res?.ok) {
          toast.success("Pesan terkirim & tersimpan!", { id: "send-msg" });
        } else {
          toast.error(
            res?.error ||
              res?.message ||
              "Email tidak ditemukan / gagal terkirim",
            { id: "send-msg" }
          );
        }
      })
      .catch((e) => {
        toast.error(e?.message || "Gagal mengirim pesan", { id: "send-msg" });
      })
      .finally(() => {
        setSending(false);
      });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">Tulis Pesan Baru</h2>
          <button onClick={resetAndClose} type="button" disabled={sending}>
            <X className="h-5 w-5 text-gray-500 hover:text-gray-800" />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Pesan akan disimpan ke database & dikirim ke email.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">
              Email Penerima <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.recipientEmail}
              onChange={(e) =>
                setForm((p) => ({ ...p, recipientEmail: e.target.value }))
              }
              placeholder="admin@gmail.com"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
              disabled={sending}
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Subjek <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) =>
                setForm((p) => ({ ...p, subject: e.target.value }))
              }
              placeholder="Subjek pesan"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
              disabled={sending}
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Pesan <span className="text-red-500">*</span>
            </label>
            <textarea
              ref={textareaRef}
              value={form.body}
              onChange={(e) =>
                setForm((p) => ({ ...p, body: e.target.value }))
              }
              placeholder="Tulis pesan..."
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none overflow-hidden min-h-20"
              disabled={sending}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={resetAndClose}
              disabled={sending}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 bg-white shadow-sm hover:bg-gray-100 transition disabled:opacity-60"
              type="button"
            >
              Batal
            </button>

            <button
              onClick={submit}
              disabled={sending}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition shadow-lg shadow-gray-400/50 bg-gradient-to-tr from-sky-700 to-sky-600 hover:from-sky-800 hover:to-sky-600 disabled:opacity-60"
              type="button"
            >
              <Send className="h-4 w-4" />
              Kirim
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
