import React, { useEffect, useRef, useState } from "react";
import {
  Loader2 as LoaderIcon,
  User as UserIcon,
  ExternalLink,
} from "lucide-react";

import useAuthStore from "../../../store/useAuthStore";
import axios from "../../../api/axiosInstance";

import ProfileSidebar from "./components/ProfileSidebar";
import ToastNotification from "./components/ToastNotification";

import DataPribadiSection from "./components/sections/DataPribadiSection";
import TentangSayaSection from "./components/sections/TentangSayaSection";
import WorkExperienceModal from "./modals/WorkExperienceModal";
import EducationModal from "./modals/EducationModal";
import OrganizationModal from "./modals/OrganizationModal";
import CertificateModal from "./modals/CertificateModal";
import SectionCard from "./components/sections/SectionCard";
import PengaturanAkunSection from "./components/sections/PengaturanAkunSection";
import KeluarSection from "./components/sections/KeluarSection";
import LamaranSayaSection from "./components/sections/LamaranSayaSection";
import SkillsSection from "./components/sections/SkillsSection";
import SkillsModal from "./modals/SkillsModal";
import DokumenSayaSection from "./components/sections/DocumentsSayaSection";
import PortfolioLinkModal from "./modals/PortofolioLinkModal";

import { defaultProfileData, menuItems } from "./utils/profileHelpers";

import { compressImageToBase64 } from "./utils/imageCompression";

const safeToISO = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
};

const months = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const formatMonthYear = (isoDate) => {
  if (!isoDate) return "-";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return "-";
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
};

const formatDuration = (startDate, endDate, isCurrent) => {
  if (!startDate) return "";
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return "";

  const end = isCurrent ? new Date() : endDate ? new Date(endDate) : null;
  if (!end || Number.isNaN(end.getTime())) return "";

  let totalMonths =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());

  if (totalMonths < 0) totalMonths = 0;

  const years = Math.floor(totalMonths / 12);
  const remMonths = totalMonths % 12;

  const parts = [];
  if (years > 0) parts.push(`${years} thn`);
  if (remMonths > 0) parts.push(`${remMonths} bln`);

  return parts.join(" ");
};

// Bentuk `profil` kosong PERSIS mengikuti kolom model `profil` di
// schema.prisma: nik, jenis_kelamin, nomor_hp, tempat_lahir,
// tanggal_lahir, alamat, foto_profil, tentang.
const emptyProfil = () => ({
  nik: "",
  jenis_kelamin: "",
  nomor_hp: "",
  tempat_lahir: "",
  alamat: "",
  tanggal_lahir: "",
  foto_profil: "",
  tentang: "",
});

// ✅ Sekarang SEMUA endpoint auth (login, checkAuth, updateProfile)
// mengembalikan bentuk toSafeUser() yang identik:
// { id, nama, email, peran, divisi, created_at, profil: { nik, ... } }
// jadi `user` dari store BISA langsung dipakai apa adanya di sini —
// tidak perlu remapping/reshape manual lagi di frontend.
const buildEditedDataFromUser = (user) => ({
  ...user,
  nama: user?.nama || "",
  profil: {
    ...emptyProfil(),
    ...(user?.profil || {}),
  },
});

const ProfilePage = () => {
  const { user, checkAuth, loading: storeLoading, setUser } = useAuthStore();

  const [activeMenu, setActiveMenu] = useState("Data Pribadi");
  const [editedData, setEditedData] = useState(defaultProfileData);
  const [isDataPribadiEditable, setIsDataPribadiEditable] = useState(false);

  const [workExperiences, setWorkExperiences] = useState([]);
  const [educations, setEducations] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [skills, setSkills] = useState([]);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [documents, setDocuments] = useState(null);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);

  const [showWorkModal, setShowWorkModal] = useState(false);
  const [editingWork, setEditingWork] = useState(null);

  const [showEducationModal, setShowEducationModal] = useState(false);
  const [editingEducation, setEditingEducation] = useState(null);

  const [showOrgModal, setShowOrgModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);

  const [showCertModal, setShowCertModal] = useState(false);
  const [editingCert, setEditingCert] = useState(null);

  const dateInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [error, setError] = useState(null);

  const [myApplications, setMyApplications] = useState([]);
  const [loadingMyApps, setLoadingMyApps] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  const [toast, setToast] = useState({ message: null, type: null });

  const showToast = (message, type) => {
    setToast({ message: Array.isArray(message) ? message : [message], type });
  };

  useEffect(() => {
    const loadWorkExperiences = async () => {
      try {
        const res = await axios.get("/profile/work-experience");
        setWorkExperiences(res?.data?.data || []);
      } catch (err) {
        console.error("Gagal mengambil pengalaman kerja:", err);
      }
    };
    loadWorkExperiences();
  }, []);

  useEffect(() => {
    const loadEducations = async () => {
      try {
        const res = await axios.get("/profile/education");
        setEducations(res?.data?.data || []);
      } catch (err) {
        console.error("Gagal mengambil data pendidikan:", err);
      }
    };
    loadEducations();
  }, []);

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const res = await axios.get("/profile/organization");
        setOrganizations(res?.data?.data || []);
      } catch (err) {
        console.error("Gagal mengambil data organisasi:", err);
      }
    };
    loadOrganizations();
  }, []);

  useEffect(() => {
    const loadCertificates = async () => {
      try {
        const res = await axios.get("/profile/certificate");
        setCertificates(res?.data?.data || []);
      } catch (err) {
        console.error("Gagal mengambil data sertifikat:", err);
      }
    };
    loadCertificates();
  }, []);

  useEffect(() => {
    const loadSkills = async () => {
      try {
        const res = await axios.get("/profile/skills");
        setSkills(res?.data?.data || []);
      } catch (err) {
        console.error("Gagal mengambil skills:", err);
      }
    };
    loadSkills();
  }, []);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const res = await axios.get("/profile/documents");
        setDocuments(res?.data?.data || null);
      } catch (err) {
        console.error("Gagal mengambil dokumen:", err);
      }
    };
    loadDocuments();
  }, []);

  useEffect(() => {
    if (!user) checkAuth();
  }, [user, checkAuth]);

  // Sinkron dari `user` (bentuk toSafeUser() — sama persis di login,
  // checkAuth, DAN updateProfile) ke `editedData` lokal.
  useEffect(() => {
    if (user) {
      setEditedData(buildEditedDataFromUser(user));
    } else {
      setEditedData(defaultProfileData);
    }
    setLoadingInitial(false);
  }, [user]);

  useEffect(() => {
    if (toast.message) {
      const timer = setTimeout(() => {
        setToast({ message: null, type: null });
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    let isMounted = true;
    if (!user) {
      setMyApplications([]);
      setLoadingMyApps(false);
      return;
    }

    const controller = new AbortController();

    const fetchMyApplications = async (signal) => {
      try {
        const res = await axios.get("/applications/me", { signal });
        const items = res?.data?.data ?? [];
        if (!isMounted || signal?.aborted) return;
        setMyApplications(Array.isArray(items) ? items : []);
      } catch {
        if (!isMounted || signal?.aborted) return;
        setMyApplications([]);
      } finally {
        if (isMounted && !signal?.aborted) setLoadingMyApps(false);
      }
    };

    setLoadingMyApps(true);
    fetchMyApplications(controller.signal);

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [user]);

  const currentPhotoUrl =
    uploadedPhoto ||
    editedData?.profil?.foto_profil ||
    defaultProfileData?.profil?.foto_profil ||
    "";

  // Satu-satunya field root (di luar `profil`) yang bisa diedit lewat
  // Data Pribadi adalah "nama" (kolom pengguna.nama). Semua field lain
  // (nik, jenis_kelamin, nomor_hp, tempat_lahir, tanggal_lahir, alamat)
  // masuk ke dalam `profil`, sesuai id yang dikirim DataPribadiSection.jsx.
  const handleDataPribadiChange = (e) => {
    const { id, value } = e.target;
    const ROOT_FIELDS = ["nama"];

    if (!ROOT_FIELDS.includes(id)) {
      setEditedData((prev) => ({
        ...prev,
        profil: {
          ...(prev?.profil || {}),
          [id]: value,
        },
      }));
    } else {
      setEditedData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setEditedData(buildEditedDataFromUser(user));
    }
    setIsDataPribadiEditable(false);
    setPasswordError(null);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setError(null);
  };

  const handleSaveDataPribadi = async () => {
    try {
      setSaving(true);
      setError(null);

      // Kirim persis nama kolom yang di-whitelist di
      // ALLOWED_PROFIL_FIELDS (auth.service.js): nik, jenis_kelamin,
      // nomor_hp, tempat_lahir, tanggal_lahir, alamat, foto_profil,
      // tentang — plus `nama` (kolom pengguna).
      const payload = {
        nama: editedData?.nama || "",
        nik: editedData?.profil?.nik || "",
        jenis_kelamin: editedData?.profil?.jenis_kelamin || "",
        nomor_hp: editedData?.profil?.nomor_hp || "",
        tempat_lahir: editedData?.profil?.tempat_lahir || "",
        tanggal_lahir: safeToISO(editedData?.profil?.tanggal_lahir),
        alamat: editedData?.profil?.alamat || "",
        foto_profil: editedData?.profil?.foto_profil || "",
        tentang: editedData?.profil?.tentang || "",
      };

      const res = await axios.put("/auth/profile", payload);

      // ✅ authService.updateProfile() sekarang mengembalikan bentuk
      // toSafeUser() yang sama persis dengan login/checkAuth — sudah
      // nested { ..., profil: {...} } — jadi bisa langsung dipakai.
      const updatedUser = res?.data?.data;

      if (updatedUser) {
        setUser(updatedUser);
        setEditedData(buildEditedDataFromUser(updatedUser));
      }

      setUploadedPhoto(null);
      setIsDataPribadiEditable(false);
      showToast("Data berhasil diperbarui!", "success");
    } catch (err) {
      const msg = err?.response?.data?.message || "Gagal menyimpan.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUploadClientPreview = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const compressedBase64 = await compressImageToBase64(file, {
        maxWidth: 800,
        quality: 0.7,
        outputMime: "image/jpeg",
      });

      setUploadedPhoto(compressedBase64);

      setEditedData((prev) => ({
        ...prev,
        profil: {
          ...(prev?.profil || {}),
          foto_profil: compressedBase64,
        },
      }));

      setIsDataPribadiEditable(true);
      setActiveMenu("Data Pribadi");
      showToast("Foto dipilih!", "success");
    } catch {
      showToast("Gagal memproses gambar.", "error");
    }
  };

  const handleSaveAkun = async () => {
    setPasswordError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Semua field password wajib diisi.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi password tidak sama.");
      return;
    }

    try {
      setSaving(true);
      await axios.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      showToast("Password berhasil diubah.", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const msg = err?.response?.data?.message || "Gagal mengubah password.";
      setPasswordError(msg);
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    showToast("Logout berhasil.", "success");
    setActiveMenu("Keluar");
  };

  const renderMainContent = () => {
    if (activeMenu === "Data Pribadi") {
      return (
        <>
          <div className="space-y-6">
            <DataPribadiSection
              editedData={editedData}
              setEditedData={setEditedData}
              isEditable={isDataPribadiEditable}
              onEdit={() => setIsDataPribadiEditable(true)}
              onCancel={handleCancelEdit}
              onSave={handleSaveDataPribadi}
              onChange={handleDataPribadiChange}
              dateInputRef={dateInputRef}
              saving={saving}
            />

            <TentangSayaSection
              tentang={editedData?.profil?.tentang || ""}
              onSave={async ({ tentang }) => {
                try {
                  const res = await axios.put("/auth/profile", { tentang });
                  // ✅ sama seperti di atas: bentuknya sudah toSafeUser()
                  // nested, langsung dipakai apa adanya.
                  const updatedUser = res?.data?.data;

                  if (updatedUser) {
                    setUser(updatedUser);
                    setEditedData(buildEditedDataFromUser(updatedUser));
                  }

                  showToast("Tentang Saya berhasil diperbarui", "success");
                } catch (err) {
                  showToast(
                    err?.response?.data?.message || "Gagal menyimpan",
                    "error",
                  );
                }
              }}
            />

            {/* PENGALAMAN KERJA */}
            <SectionCard
              title="Pengalaman Kerja"
              items={workExperiences}
              emptyText="Belum ada pengalaman kerja"
              onAdd={() => {
                setEditingWork(null);
                setShowWorkModal(true);
              }}
              onEdit={(item) => {
                setEditingWork(item);
                setShowWorkModal(true);
              }}
              onDelete={async (item) => {
                try {
                  await axios.delete(`/profile/work-experience/${item.id}`);
                  setWorkExperiences((prev) =>
                    prev.filter((work) => String(work.id) !== String(item.id)),
                  );

                  showToast("Pengalaman kerja berhasil dihapus", "success");
                } catch (err) {
                  showToast(
                    err?.response?.data?.message || "Gagal menghapus data",
                    "error",
                  );
                }
              }}
              // Field persis kolom Prisma model `pengalaman_kerja`
              renderItem={(item) => (
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {item.jabatan}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {item.perusahaan}
                    {item.jenis_pekerjaan ? ` · ${item.jenis_pekerjaan}` : ""}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {item.bulan_mulai && item.tahun_mulai
                      ? `${months[item.bulan_mulai - 1]} ${item.tahun_mulai}`
                      : "-"}
                    {" - "}
                    {item.sedang_bekerja
                      ? "Sekarang"
                      : item.bulan_selesai && item.tahun_selesai
                        ? `${months[item.bulan_selesai - 1]} ${item.tahun_selesai}`
                        : "-"}
                  </p>
                  {item.lokasi && (
                    <p className="text-xs text-gray-400">{item.lokasi}</p>
                  )}
                </div>
              )}
            />

            <WorkExperienceModal
              isOpen={showWorkModal}
              editingItem={editingWork}
              onClose={() => {
                setShowWorkModal(false);
                setEditingWork(null);
              }}
              onSuccess={(data, isEdit) => {
                if (isEdit) {
                  setWorkExperiences((prev) =>
                    prev.map((work) =>
                      String(work.id) === String(data.id) ? data : work,
                    ),
                  );

                  showToast("Pengalaman kerja berhasil diperbarui", "success");
                } else {
                  setWorkExperiences((prev) => [data, ...prev]);

                  showToast("Pengalaman kerja berhasil ditambahkan", "success");
                }
              }}
            />

            {/* PENDIDIKAN */}
            <SectionCard
              title="Pendidikan"
              items={educations}
              emptyText="Belum ada data pendidikan"
              onAdd={() => {
                setEditingEducation(null);
                setShowEducationModal(true);
              }}
              onEdit={(item) => {
                setEditingEducation(item);
                setShowEducationModal(true);
              }}
              onDelete={async (item) => {
                try {
                  await axios.delete(`/profile/education/${item.id}`);
                  setEducations((prev) =>
                    prev.filter((edu) => String(edu.id) !== String(item.id)),
                  );

                  showToast("Pendidikan berhasil dihapus", "success");
                } catch (err) {
                  showToast(
                    err?.response?.data?.message || "Gagal menghapus data",
                    "error",
                  );
                }
              }}
              // Field persis kolom Prisma model `pendidikan`.
              // Kolom `description` tidak ada di model `pendidikan`,
              // jadi baris description tidak ditampilkan.
              renderItem={(item) => {
                const duration = formatDuration(
                  item.tanggal_mulai,
                  item.tanggal_selesai,
                  item.sedang_berlangsung,
                );

                return (
                  <div className="flex gap-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {item.institusi}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {[item.gelar, item.jurusan]
                          .filter(Boolean)
                          .join(" - ") || "-"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatMonthYear(item.tanggal_mulai)}
                        {" - "}
                        {item.sedang_berlangsung
                          ? "Sekarang"
                          : formatMonthYear(item.tanggal_selesai)}
                        {duration ? ` · ${duration}` : ""}
                      </p>
                    </div>
                  </div>
                );
              }}
            />

            <EducationModal
              isOpen={showEducationModal}
              editingItem={editingEducation}
              onClose={() => {
                setShowEducationModal(false);
                setEditingEducation(null);
              }}
              onSuccess={(data, isEdit) => {
                if (isEdit) {
                  setEducations((prev) =>
                    prev.map((edu) =>
                      String(edu.id) === String(data.id) ? data : edu,
                    ),
                  );

                  showToast("Pendidikan berhasil diperbarui", "success");
                } else {
                  setEducations((prev) => [data, ...prev]);

                  showToast("Pendidikan berhasil ditambahkan", "success");
                }
              }}
              onDeleted={(item) => {
                setEducations((prev) =>
                  prev.filter((edu) => String(edu.id) !== String(item.id)),
                );

                showToast("Pendidikan berhasil dihapus", "success");
              }}
            />

            {/* PENGALAMAN ORGANISASI */}
            <SectionCard
              title="Pengalaman Organisasi"
              items={organizations}
              emptyText="Belum ada pengalaman organisasi"
              onAdd={() => {
                setEditingOrg(null);
                setShowOrgModal(true);
              }}
              onEdit={(item) => {
                setEditingOrg(item);
                setShowOrgModal(true);
              }}
              onDelete={async (item) => {
                try {
                  await axios.delete(`/profile/organization/${item.id}`);
                  setOrganizations((prev) =>
                    prev.filter((org) => String(org.id) !== String(item.id)),
                  );

                  showToast(
                    "Pengalaman organisasi berhasil dihapus",
                    "success",
                  );
                } catch (err) {
                  showToast(
                    err?.response?.data?.message || "Gagal menghapus data",
                    "error",
                  );
                }
              }}
              // Field persis kolom Prisma model `organisasi`
              renderItem={(item) => (
                <div>
                  <h4 className="font-semibold text-gray-900">{item.peran}</h4>
                  <p className="text-sm text-gray-600">{item.nama_organisasi}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatMonthYear(item.tanggal_mulai)}
                    {" - "}
                    {item.sedang_berlangsung
                      ? "Sekarang"
                      : formatMonthYear(item.tanggal_selesai)}
                  </p>
                  {item.deskripsi && (
                    <p className="text-sm text-gray-500 mt-1 whitespace-pre-line">
                      {item.deskripsi}
                    </p>
                  )}
                </div>
              )}
            />

            <OrganizationModal
              isOpen={showOrgModal}
              editingItem={editingOrg}
              onClose={() => {
                setShowOrgModal(false);
                setEditingOrg(null);
              }}
              onSuccess={(data, isEdit) => {
                if (isEdit) {
                  setOrganizations((prev) =>
                    prev.map((org) =>
                      String(org.id) === String(data.id) ? data : org,
                    ),
                  );

                  showToast(
                    "Pengalaman organisasi berhasil diperbarui",
                    "success",
                  );
                } else {
                  setOrganizations((prev) => [data, ...prev]);

                  showToast(
                    "Pengalaman organisasi berhasil ditambahkan",
                    "success",
                  );
                }
              }}
              onDeleted={(item) => {
                setOrganizations((prev) =>
                  prev.filter((org) => String(org.id) !== String(item.id)),
                );

                showToast("Pengalaman organisasi berhasil dihapus", "success");
              }}
            />

            {/* SERTIFIKAT */}
            <SectionCard
              title="Sertifikat"
              items={certificates}
              emptyText="Belum ada sertifikat"
              onAdd={() => {
                setEditingCert(null);
                setShowCertModal(true);
              }}
              onEdit={(item) => {
                setEditingCert(item);
                setShowCertModal(true);
              }}
              onDelete={async (item) => {
                try {
                  await axios.delete(`/profile/certificate/${item.id}`);
                  setCertificates((prev) =>
                    prev.filter((cert) => String(cert.id) !== String(item.id)),
                  );

                  showToast("Sertifikat berhasil dihapus", "success");
                } catch (err) {
                  showToast(
                    err?.response?.data?.message || "Gagal menghapus data",
                    "error",
                  );
                }
              }}
              // Field persis kolom Prisma model `sertifikat`.
              // Tag <a> untuk buka file sertifikat tetap ada, href-nya
              // dari `item.file_sertifikat`.
              renderItem={(item) => {
                return (
                  <div className="flex gap-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {item.nama}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {item.penerbit}
                        {item.diterbitkan
                          ? ` • Dikeluarkan ${formatMonthYear(item.diterbitkan)}`
                          : ""}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.kadaluarsa
                          ? `Berlaku hingga ${formatMonthYear(item.kadaluarsa)}`
                          : "Tidak memiliki batas waktu masa aktif"}
                      </p>
                    </div>
                  </div>
                );
              }}
            />

            <CertificateModal
              isOpen={showCertModal}
              editingItem={editingCert}
              onClose={() => {
                setShowCertModal(false);
                setEditingCert(null);
              }}
              onSuccess={(data, isEdit) => {
                if (isEdit) {
                  setCertificates((prev) =>
                    prev.map((cert) =>
                      String(cert.id) === String(data.id) ? data : cert,
                    ),
                  );

                  showToast("Sertifikat berhasil diperbarui", "success");
                } else {
                  setCertificates((prev) => [data, ...prev]);

                  showToast("Sertifikat berhasil ditambahkan", "success");
                }
              }}
              onDeleted={(item) => {
                setCertificates((prev) =>
                  prev.filter((cert) => String(cert.id) !== String(item.id)),
                );

                showToast("Sertifikat berhasil dihapus", "success");
              }}
            />

            <SkillsSection
              skills={skills}
              onEdit={() => setShowSkillsModal(true)}
            />

            <SkillsModal
              isOpen={showSkillsModal}
              currentSkills={skills}
              onClose={() => setShowSkillsModal(false)}
              onSuccess={(newSkills) => {
                setSkills(newSkills);
                showToast("Skills berhasil diperbarui", "success");
              }}
            />
          </div>
        </>
      );
    }

    if (activeMenu === "Pengaturan Akun") {
      return (
        <PengaturanAkunSection
          currentPassword={currentPassword}
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          setCurrentPassword={setCurrentPassword}
          setNewPassword={setNewPassword}
          setConfirmPassword={setConfirmPassword}
          showCurrentPassword={showCurrentPassword}
          showNewPassword={showNewPassword}
          showConfirmPassword={showConfirmPassword}
          setShowCurrentPassword={setShowCurrentPassword}
          setShowNewPassword={setShowNewPassword}
          setShowConfirmPassword={setShowConfirmPassword}
          passwordError={passwordError}
          setPasswordError={setPasswordError}
          onSave={handleSaveAkun}
        />
      );
    }

    if (activeMenu === "Keluar") {
      return <KeluarSection />;
    }

    return (
      <div className="p-6 text-gray-500 bg-white rounded-xl">
        Konten belum tersedia.
      </div>
    );
  };

  if (storeLoading || loadingInitial) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white">
        <LoaderIcon className="w-12 h-12 text-sky-600 animate-spin mb-3" />
        <p className="text-sky-700 font-semibold text-lg">
          Memuat data pengguna...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 font-sans bg-gray-50 min-h-screen">
      <ToastNotification
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: null, type: null })}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/3 space-y-6">
          <ProfileSidebar
            nama={editedData?.nama || "Nama Pengguna"}
            currentPhotoUrl={currentPhotoUrl}
            fileInputRef={fileInputRef}
            isHovered={isHovered}
            setIsHovered={setIsHovered}
            onPhotoChange={handlePhotoUploadClientPreview}
            onPickPhoto={() =>
              fileInputRef.current && fileInputRef.current.click()
            }
            activeMenu={activeMenu}
            setActiveMenu={(menu) => {
              setActiveMenu(menu);
              if (menu === "Keluar") handleLogout();
            }}
            menuItems={menuItems}
            FallbackIcon={UserIcon}
          />

          <DokumenSayaSection
            documents={documents}
            onDocumentsUpdated={(newDocs) => {
              setDocuments(newDocs);
              showToast("Dokumen berhasil diperbarui", "success");
            }}
            onOpenPortfolioModal={() => setShowPortfolioModal(true)}
          />
        </div>

        <div className="w-full lg:w-3/4 space-y-6">
          {loadingMyApps ? (
            <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 border border-gray-100">
              <p className="text-gray-600 font-medium">
                Memuat daftar lamaran...
              </p>
            </div>
          ) : (
            <LamaranSayaSection applications={myApplications} />
          )}

          {renderMainContent()}
        </div>
      </div>

      <PortfolioLinkModal
        isOpen={showPortfolioModal}
        currentLink={!documents?.portfolioName ? documents?.portfolioUrl : null}
        onClose={() => setShowPortfolioModal(false)}
        onSuccess={(newDocs) => {
          setDocuments(newDocs);
          setShowPortfolioModal(false);
        }}
      />

      {saving && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/90">
          <LoaderIcon className="w-12 h-12 text-sky-600 animate-spin mb-3" />
          <p className="text-sky-700 font-semibold text-lg">
            Menyimpan perubahan...
          </p>
        </div>
      )}

      {error && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-red-50 text-red-700 px-4 py-2 rounded-lg shadow">
          {error}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;