import React, { useState } from "react";
import { Search, Download, UserPlus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import useUsers from "./hooks/useUsers";
import UserFormModal from "./UserFormModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import UserAvatar from "./components/UserAvatar";

const ROLE_LABEL = {
  admin: "Admin",
  divisi: "Divisi",
};

const DIVISI_FILTER_OPTIONS = [
  "Holdings",
  "Commercial",
  "Creative & Production",
  "ICT",
  "General Affairs",
  "Human Capital",
  "Risk & Legal",
];

function getPageNumbers(current, total) {
  const delta = 1;
  const range = [];
  const withDots = [];
  let last;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }

  range.forEach((i) => {
    if (last) {
      if (i - last === 2) withDots.push(last + 1);
      else if (i - last !== 1) withDots.push("...");
    }
    withDots.push(i);
    last = i;
  });

  return withDots;
}

export default function UserManagementPage() {
  const {
    users,
    pagination,
    filters,
    setFilters,
    loading,
    error,
    exporting,
    fetchUsers,
    deleteUser,
    exportUsers,
  } = useUsers();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteUser(deletingUser.id);
      setDeletingUser(null);
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus user.");
    } finally {
      setDeleting(false);
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setModalOpen(true);
  };

  const pageNumbers = getPageNumbers(pagination.page, pagination.totalPages);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Manajemen User</h1>
          <p className="text-sm text-gray-500">
            Kelola seluruh akun pengguna, hak akses, dan divisi dalam satu halaman.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportUsers}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm disabled:opacity-60"
          >
            <Download className="w-4 h-4" /> {exporting ? "Mengekspor..." : "Ekspor"}
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 text-sm"
          >
            <UserPlus className="w-4 h-4" /> Tambah User
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            placeholder="Cari user..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </div>

        <select
          value={filters.role}
          onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value }))}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
        >
          <option value="all">Semua Role</option>
          <option value="admin">Admin</option>
          <option value="divisi">Divisi</option>
        </select>

        <select
          value={filters.divisi}
          onChange={(e) => setFilters((f) => ({ ...f, divisi: e.target.value }))}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
        >
          <option value="all">Semua Divisi</option>
          {DIVISI_FILTER_OPTIONS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">USER</th>
              <th className="px-4 py-3">EMAIL</th>
              <th className="px-4 py-3">ROLE</th>
              <th className="px-4 py-3">DIVISI</th>
              <th className="px-4 py-3">TERAKHIR LOGIN</th>
              <th className="px-4 py-3 text-right">AKSI</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">Memuat...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">Tidak ada user.</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar 
                        name={u.nama} 
                        src={u.profil?.foto_profil} 
                      />
                      <div>
                        <div className="font-medium text-gray-800">{u.nama}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 text-gray-600">{ROLE_LABEL[u.peran] || u.peran}</td>
                  <td className="px-4 py-3 text-gray-600">{u.divisi || "-"}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {u.login_terakhir 
                      ? new Date(u.login_terakhir).toLocaleDateString("id-ID", { day: '2-digit', month: 'long', year: 'numeric' }) 
                      : "Belum pernah"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditModal(u)} className="p-2 rounded-lg hover:bg-gray-100">
                        <Pencil className="w-4 h-4 text-gray-500" />
                      </button>
                      <button onClick={() => setDeletingUser(u)} className="p-2 rounded-lg hover:bg-red-50">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
          <span>Menampilkan 1 - {users.length} dari {pagination.total} user</span>
          <div className="flex items-center gap-1">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchUsers(pagination.page - 1)}
              className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {pageNumbers.map((p, idx) =>
              p === "..." ? (
                <span key={`dots-${idx}`} className="px-2 text-gray-400">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => fetchUsers(p)}
                  className={`w-8 h-8 rounded-lg text-sm ${
                    p === pagination.page
                      ? "bg-sky-600 text-white font-medium"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchUsers(pagination.page + 1)}
              className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <UserFormModal
          key={editingUser?.id ?? "new"}
          user={editingUser}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); fetchUsers(pagination.page); }}
        />
      )}

      <DeleteConfirmModal
        user={deletingUser}
        deleting={deleting}
        onCancel={() => setDeletingUser(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}