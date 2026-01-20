import React, { useEffect, useRef, useState } from "react";
import { X, Send } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axiosInstance"; // ✅ tambah ini (sesuaikan path kalau beda)

const DEFAULT_FORM = { recipientEmail: "", subject: "", body: "" };

export default function ComposeDialog({ open, onClose, onSend }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [sending, setSending] = useState(false);
  const textareaRef = useRef(null);

  // ✅ tambahan dropdown state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const emailInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setForm(DEFAULT_FORM);

    // reset dropdown
    setShowSuggestions(false);
    setSuggestions([]);
    setFetching(false);
    setActiveIndex(-1);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [form.body, open]);

  // ✅ close dropdown kalau klik di luar
  useEffect(() => {
    if (!open) return;

    const handler = (e) => {
      const t = e.target;
      const inInput = emailInputRef.current?.contains(t);
      const inDropdown = suggestionsRef.current?.contains(t);
      if (!inInput && !inDropdown) {
        setShowSuggestions(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!open) return null;

  const resetAndClose = () => {
    setForm(DEFAULT_FORM);
    setShowSuggestions(false);
    setSuggestions([]);
    setFetching(false);
    setActiveIndex(-1);
    onClose?.();
  };

  // ✅ fetch email suggestions dari backend
  const fetchSuggestions = async (q) => {
    const keyword = String(q || "").trim();
    if (!keyword) {
      setSuggestions([]);
      return;
    }

    try {
      setFetching(true);
      const res = await axiosInstance.get("/users/emails", {
        params: { q: keyword },
      });

      const items = res?.data?.items;
      setSuggestions(Array.isArray(items) ? items : []);
    } catch {
      setSuggestions([]);
    } finally {
      setFetching(false);
    }
  };

  const onEmailChange = (val) => {
    setForm((p) => ({ ...p, recipientEmail: val }));
    setShowSuggestions(true);
    setActiveIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 250);
  };

  const pickEmail = (email) => {
    setForm((p) => ({ ...p, recipientEmail: email }));
    setShowSuggestions(false);
    setActiveIndex(-1);
    setTimeout(() => emailInputRef.current?.focus(), 0);
  };

  const onEmailKeyDown = (e) => {
    if (!showSuggestions) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => {
        const next = prev + 1;
        return next >= suggestions.length ? 0 : next;
      });
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => {
        const next = prev - 1;
        return next < 0 ? Math.max(suggestions.length - 1, 0) : next;
      });
    }

    if (e.key === "Enter") {
      if (suggestions.length > 0 && activeIndex >= 0) {
        e.preventDefault();
        const picked = suggestions[activeIndex];
        if (picked?.email) pickEmail(picked.email);
      }
    }

    if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
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
            { id: "send-msg" },
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

  const showDropdown =
    showSuggestions && !sending && (fetching || suggestions.length > 0);

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
          {/* ✅ EMAIL + DROPDOWN */}
          <div className="relative">
            <label className="text-sm font-medium">
              Email Penerima <span className="text-red-500">*</span>
            </label>
            <input
              ref={emailInputRef}
              type="email"
              value={form.recipientEmail}
              onChange={(e) => onEmailChange(e.target.value)}
              onFocus={() => {
                setShowSuggestions(true);
                if (form.recipientEmail?.trim())
                  fetchSuggestions(form.recipientEmail);
              }}
              onKeyDown={onEmailKeyDown}
              placeholder="admin@gmail.com"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
              disabled={sending}
              autoComplete="off"
            />

            {showDropdown ? (
              <div
                ref={suggestionsRef}
                className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
              >
                <div className="max-h-56 overflow-y-auto">
                  {fetching ? (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      Mencari email...
                    </div>
                  ) : (
                    suggestions.map((u, idx) => {
                      const isActive = idx === activeIndex;
                      return (
                        <button
                          key={`${u.email}-${idx}`}
                          type="button"
                          onMouseEnter={() => setActiveIndex(idx)}
                          onClick={() => pickEmail(u.email)}
                          className={`w-full text-left px-3 py-2 transition ${
                            isActive
                              ? "bg-sky-50 text-sky-800"
                              : "bg-white text-gray-800 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">
                                {u?.name || "User"}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {u.email}
                              </p>
                            </div>
                            <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                              pilih
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}

                  {!fetching && suggestions.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      Tidak ada email yang cocok.
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
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
              onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
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
