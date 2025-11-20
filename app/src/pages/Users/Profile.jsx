import React, { useState, useEffect } from "react";
import { Loader2, Edit, Save, X } from "lucide-react";
import useAuthStore from "../../store/useAuthStore";
import axios from "../../api/axiosInstance";
import { toast } from "react-hot-toast";

function Profile() {
  const { user, checkAuth, loading: storeLoading, setUser } = useAuthStore();
  const [editedData, setEditedData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const ROOT_FIELDS = ["name", "email"];

  // Load user saat pertama render
  useEffect(() => {
    if (!user) checkAuth();
  }, [user, checkAuth]);

  // Sinkronisasi store dengan local state
  useEffect(() => {
    if (user) setEditedData(user);
  }, [user]);

  if (storeLoading || !editedData) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[9999]">
        <Loader2 className="w-12 h-12 text-sky-600 animate-spin mb-3" />
        <p className="text-sky-700 font-semibold text-lg">
          Memuat data pengguna...
        </p>
      </div>
    );
  }

  // ----------------------
  // HANDLE CHANGE
  // ----------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (!ROOT_FIELDS.includes(name)) {
      setEditedData((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          [name]: value,
        },
      }));
    } else {
      setEditedData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // ----------------------
  // SAVE TO BACKEND
  // ----------------------
  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");


      const payload = {
        fullName: editedData.profile.fullName,
        NIK: editedData.profile.NIK,
        gender: editedData.profile.gender,
        nomorHp: editedData.profile.nomorHp,
        tempatLahir: editedData.profile.tempatLahir,
        tanggalLahir: editedData.profile.tanggalLahir
          ? new Date(editedData.profile.tanggalLahir).toISOString()
          : null,
        alamat: editedData.profile.alamat,
        fotoProfile: editedData.profile.fotoProfile,
        about: editedData.profile.about,
      };

      const res = await axios.put("/auth/profile", payload);

      // update store user
      setUser({ ...editedData, profile: res.data.data });
      setIsEditing(false);

       toast.success("Profil berhasil diperbarui!");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-10 px-6">
      {saving && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
          <Loader2 className="w-12 h-12 text-sky-600 animate-spin mb-3" />
          <p className="text-sky-700 font-semibold text-lg">
            Menyimpan perubahan...
          </p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8">
        <h1 className="text-3xl font-extrabold text-sky-700 text-center mb-6">
          Profil Pengguna
        </h1>

        {error && (
          <p className="text-red-600 text-center font-semibold mb-3">{error}</p>
        )}

        <div className="space-y-4">
          {/* Nama */}
          <div>
            <label className="font-semibold text-gray-700 block mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              name="name"
              value={editedData.name || ""}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full border rounded-lg px-4 py-2 disabled:bg-gray-100"
            />
          </div>

          {/* Email */}
          <div>
            <label className="font-semibold text-gray-700 block mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={editedData.email || ""}
              disabled
              className="w-full border rounded-lg px-4 py-2 bg-gray-100"
            />
          </div>

          {/* Nomor HP */}
          <div>
            <label className="font-semibold text-gray-700 block mb-1">
              Nomor Telepon
            </label>
            <input
              type="text"
              name="nomorHp"
              value={editedData?.profile?.nomorHp || ""}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full border rounded-lg px-4 py-2 disabled:bg-gray-100"
            />
          </div>

          {/* NIK */}
          <div>
            <label className="font-semibold text-gray-700 block mb-1">
              NIK
            </label>
            <input
              type="text"
              name="NIK"
              value={editedData?.profile?.NIK || ""}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full border rounded-lg px-4 py-2 disabled:bg-gray-100"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="font-semibold text-gray-700 block mb-1">
              Jenis Kelamin
            </label>
            <select
              name="gender"
              value={editedData?.profile?.gender || ""}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full border rounded-lg px-4 py-2 disabled:bg-gray-100"
            >
              <option value="">Pilih</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          {/* Tempat Lahir */}
          <div>
            <label className="font-semibold text-gray-700 block mb-1">
              Tempat Lahir
            </label>
            <input
              type="text"
              name="tempatLahir"
              value={editedData?.profile?.tempatLahir || ""}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full border rounded-lg px-4 py-2 disabled:bg-gray-100"
            />
          </div>

          {/* Tanggal Lahir */}
          <div>
            <label className="font-semibold text-gray-700 block mb-1">
              Tanggal Lahir
            </label>
            <input
              type="date"
              name="tanggalLahir"
              value={
                editedData?.profile?.tanggalLahir
                  ? new Date(editedData.profile.tanggalLahir)
                      .toISOString()
                      .substring(0, 10)
                  : ""
              }
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full border rounded-lg px-4 py-2 disabled:bg-gray-100"
            />
          </div>

          {/* Alamat */}
          <div>
            <label className="font-semibold text-gray-700 block mb-1">
              Alamat
            </label>
            <textarea
              name="alamat"
              value={editedData?.profile?.alamat || ""}
              onChange={handleChange}
              disabled={!isEditing}
              rows={3}
              className="w-full border rounded-lg px-4 py-2 disabled:bg-gray-100"
            />
          </div>

          {/* Tentang Saya */}
          <div>
            <label className="font-semibold text-gray-700 block mb-1">
              Tentang Saya
            </label>
            <textarea
              name="about"
              value={editedData?.profile?.about || ""}
              onChange={handleChange}
              disabled={!isEditing}
              rows={3}
              className="w-full border rounded-lg px-4 py-2 disabled:bg-gray-100"
            />
          </div>
        </div>

        <div className="flex justify-center mt-8 space-x-4">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-sky-600 text-white px-6 py-2 rounded-lg"
            >
              <Edit size={18} /> Edit Profil
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg"
              >
                <Save size={18} /> Simpan
              </button>
              <button
                onClick={() => {
                  setEditedData(user);
                  setIsEditing(false);
                  setError("");
                }}
                className="flex items-center gap-2 bg-gray-300 text-gray-800 px-6 py-2 rounded-lg"
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
