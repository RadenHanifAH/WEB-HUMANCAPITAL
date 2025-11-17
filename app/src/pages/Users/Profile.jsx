import React, { useState, useEffect } from "react";
import { Loader2, Edit, Save, X } from "lucide-react";
import useAuthStore from "../../store/useAuthStore";
import axios from "../../api/axiosInstance";

function Profile() {
  const { user, checkAuth, loading: storeLoading, set } = useAuthStore();
  const [editedData, setEditedData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // --- Ambil data user saat mount ---
  useEffect(() => {
    if (!user) checkAuth();
  }, [user, checkAuth]);

  // --- Sinkronisasi store user ke state lokal ---
  useEffect(() => {
    if (user) setEditedData(user);
  }, [user]);

  if (storeLoading || !editedData) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[9999]">
        <Loader2 className="w-12 h-12 text-sky-600 animate-spin mb-3" />
        <p className="text-sky-700 font-semibold text-lg">Memuat data pengguna...</p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      const res = await axios.put(`/auth/update-profile/${editedData.id}`, editedData);
      // update store user langsung
      set({ user: res.data.user });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError("Gagal menyimpan perubahan. Coba lagi nanti.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-10 px-6">
      {saving && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
          <Loader2 className="w-12 h-12 text-sky-600 animate-spin mb-3" />
          <p className="text-sky-700 font-semibold text-lg">Menyimpan perubahan...</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8">
        <h1 className="text-3xl font-extrabold text-sky-700 text-center mb-6">
          Profil Pengguna
        </h1>

        {error && <p className="text-red-600 text-center font-semibold mb-3">{error}</p>}

        <div className="space-y-4">
          <div>
            <label className="font-semibold text-gray-700 block mb-1">Nama Lengkap</label>
            <input
              type="text"
              name="name"
              value={editedData.name || ""}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 block mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={editedData.email || ""}
              disabled
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-500 bg-gray-100"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 block mb-1">Nomor Telepon</label>
            <input
              type="text"
              name="noHp"
              value={editedData.noHp || ""}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 block mb-1">NIK</label>
            <input
              type="text"
              name="nik"
              value={editedData.nik || ""}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100"
            />
          </div>
        </div>

        <div className="flex justify-center mt-8 space-x-4">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-sky-600 text-white px-6 py-2 rounded-lg hover:bg-sky-700 transition"
            >
              <Edit size={18} /> Edit Profil
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
              >
                <Save size={18} /> Simpan
              </button>
              <button
                onClick={() => {
                  setEditedData(user);
                  setIsEditing(false);
                }}
                className="flex items-center gap-2 bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                <X size={18} /> Batal
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
