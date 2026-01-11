import React, { useEffect, useState } from "react";
import { Plus, Search, Send, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import {
  fetchMessages,
  sendMessage,
  deleteMessage,
  deleteAllMessages,
} from "./services/messages.api";

import StatusFilter from "./components/StatusFilter";
import ComposeDialog from "./components/ComposeDialog";
import MessageCard from "./components/MessageCard";
import ConfirmDeleteDialog from "./components/ConfirmDeleteDialog";

export default function MessagesPage() {
  const [loading, setLoading] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const [data, setData] = useState({
    items: [],
    total: 0,
    page: 1,
    pageSize: 4,
  });

  // ✅ state modal delete
  const [confirm, setConfirm] = useState({
    open: false,
    type: null, // "one" | "all"
    payload: null, // msg (one) atau {q, status} (all)
    loading: false,
  });

  const load = async ({ page = data.page, pageSize = data.pageSize } = {}) => {
    try {
      setLoading(true);
      const res = await fetchMessages({ q, status, page, pageSize });
      setData({
        items: res.items || [],
        total: res.total || 0,
        page: res.page || page,
        pageSize: res.pageSize || pageSize,
      });
    } catch (e) {
      console.error(e);
      toast.error("Gagal memuat pesan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status]);

  const handleSend = async (form) => {
    const res = await sendMessage(form);
    await load({ page: 1 });
    return res;
  };

  // ✅ buka modal hapus 1
  const handleDeleteOne = (msg) => {
    setConfirm({
      open: true,
      type: "one",
      payload: msg,
      loading: false,
    });
  };

  // ✅ buka modal hapus semua
  const handleDeleteAll = () => {
    if (!data.total) return;

    setConfirm({
      open: true,
      type: "all",
      payload: { q, status },
      loading: false,
    });
  };

  // ✅ aksi ketika klik "Hapus" pada modal
  const confirmDelete = async () => {
    setConfirm((s) => ({ ...s, loading: true }));

    try {
      if (confirm.type === "one") {
        await deleteMessage(confirm.payload.id);
        toast.success("Pesan berhasil dihapus");
      } else if (confirm.type === "all") {
        await deleteAllMessages(confirm.payload);
        toast.success("Semua pesan berhasil dihapus");
      }

      await load({ page: 1 });
      setConfirm({ open: false, type: null, payload: null, loading: false });
    } catch (e) {
      console.error(e);
      toast.error("Gagal menghapus pesan");
      setConfirm((s) => ({ ...s, loading: false }));
    }
  };

  const closeConfirm = () => {
    if (confirm.loading) return;
    setConfirm({ open: false, type: null, payload: null, loading: false });
  };

  const buildConfirmDescription = () => {
    if (confirm.type === "one") {
      const msg = confirm.payload;
      return `Pesan ini akan dihapus permanen.\n\nTo: ${msg?.recipientEmail}\nSubject: ${msg?.subject}\n\nTindakan ini tidak bisa dibatalkan.`;
    }

    if (confirm.type === "all") {
      const filterInfo = [
        q ? `keyword: "${q}"` : null,
        status !== "all" ? `status: ${status}` : null,
      ]
        .filter(Boolean)
        .join(", ");

      return `Semua pesan${
        filterInfo ? ` (${filterInfo})` : ""
      } akan dihapus permanen.\n\nTindakan ini tidak bisa dibatalkan.`;
    }

    return "";
  };

  return (
    <div className="flex flex-col h-full p-6 bg-gray-50">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-sky-900 mb-3">
          Manajemen Pesan
        </h1>

        <div className="flex items-center gap-3">
          {/* ✅ Hapus All */}
          <button
            onClick={handleDeleteAll}
            disabled={loading || data.total === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border bg-white text-gray-700 font-semibold disabled:opacity-50 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition"
            type="button"
          >
            <Trash2 className="h-5 w-5" />
            Hapus Semua
          </button>

          <button
            onClick={() => setComposeOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-semibold transition shadow-lg shadow-gray-400/50 bg-gradient-to-tr from-sky-700 to-sky-600 hover:from-sky-800 hover:to-sky-600"
            type="button"
          >
            <Plus className="h-5 w-5" />
            Tulis Pesan Baru
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Cari pesan..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <StatusFilter value={status} onChange={(v) => setStatus(v)} />
      </div>

      {/* List */}
      <div className="space-y-4 overflow-y-auto flex-1 pb-4">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading...</div>
        ) : data.items.length > 0 ? (
          data.items.map((msg) => (
            <MessageCard key={msg.id} msg={msg} onDelete={handleDeleteOne} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <Send className="h-10 w-10 mb-2 text-gray-400" />
            <p>Tidak ada pesan yang ditemukan.</p>
          </div>
        )}
      </div>

      {/* Pagination simple */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Total: <b>{data.total}</b>
        </div>

        <div className="flex gap-2">
          <button
            disabled={data.page <= 1 || loading}
            onClick={() => load({ page: data.page - 1 })}
            className="px-3 py-2 rounded-lg border bg-white disabled:opacity-50"
            type="button"
          >
            Prev
          </button>

          <div className="px-3 py-2 text-sm text-gray-700">
            Page {data.page}
          </div>

          <button
            disabled={data.page * data.pageSize >= data.total || loading}
            onClick={() => load({ page: data.page + 1 })}
            className="px-3 py-2 rounded-lg border bg-white disabled:opacity-50"
            type="button"
          >
            Next
          </button>
        </div>
      </div>

      <ComposeDialog
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        onSend={handleSend}
      />

      {/* ✅ Modal confirm delete */}
      <ConfirmDeleteDialog
        open={confirm.open}
        loading={confirm.loading}
        title={confirm.type === "all" ? "Hapus Semua Pesan" : "Hapus Pesan"}
        description={buildConfirmDescription()}
        confirmText={confirm.type === "all" ? "Hapus Semua" : "Hapus"}
        onConfirm={confirmDelete}
        onClose={closeConfirm}
      />
    </div>
  );
}
