import React, { useEffect, useState } from "react";
import { X, Calendar, Clock, MapPin, User, CheckSquare, Square, Loader2, Video } from "lucide-react";
import { SCHEDULE_TYPES } from "./constants";
import { fetchApplicantsByStage, bulkCreateSchedule, deleteSchedule } from "../services/schedules.api";
import LocationStep from "./Locationstep";
import { buildLocationPayload, locationSummaryLabel } from "./LocationData";
import toast from "react-hot-toast";

// ── Helper H+1 ────────────────────────────────────────────────────────────
// Menghasilkan string tanggal besok dalam format YYYY-MM-DD untuk
// digunakan sebagai nilai `min` pada input date, sehingga hari ini
// tidak bisa dipilih di date picker.
const getTomorrowDateString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yyyy = tomorrow.getFullYear();
  const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const dd = String(tomorrow.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const INITIAL_LOCATION = {
  meetingMode: "office", // "office" | "online"
  officeId: "",
  onlineLink: "",
};

const STEP_LABELS = ["Pilih Kandidat", "Pilih Lokasi", "Atur Jadwal"];

/**
 * @param {boolean} open
 * @param {() => void} onClose
 * @param {() => void} onCreated
 * @param {string} [initialType] - ✅ BARU: kalau diisi (mis. dari alur
 *   reschedule), tab tipe jadwal langsung terbuka di tipe ini, bukan
 *   selalu SCHEDULE_TYPES[0].
 * @param {{applicationId:number, applicantName?:string, position?:string, avatar?:string}} [preselectedApplicant]
 *   ✅ BARU: kalau diisi, kandidat ini otomatis ter-centang begitu daftar
 *   kandidat untuk initialType selesai dimuat — dipakai supaya alur
 *   "Reschedule" tidak perlu mencari & mencentang ulang kandidat yang sama.
 * @param {number} [scheduleIdToReplace] - ✅ BARU: kalau diisi (alur
 *   reschedule), jadwal dengan id ini akan DIHAPUS setelah jadwal baru
 *   berhasil dibuat (bukan sebelumnya) — supaya data jadwal lama tidak
 *   hilang percuma kalau user batal mengisi form di tengah jalan.
 */
export default function ScheduleForm({
  open,
  onClose,
  onCreated,
  initialType,
  preselectedApplicant,
  scheduleIdToReplace,
}) {
  const [step, setStep] = useState(1); // 1 = kandidat, 2 = lokasi, 3 = jadwal
  const [selectedType, setSelectedType] = useState(
    initialType || SCHEDULE_TYPES[0].value
  );

  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [checkedIds, setCheckedIds] = useState([]); // applicationId[]

  const [location, setLocation] = useState(INITIAL_LOCATION);
  const [form, setForm] = useState({ date: "", time: "" });
  const [submitting, setSubmitting] = useState(false);

  // ✅ BARU: setiap kali modal dibuka, pastikan tipe yang aktif mengikuti
  // initialType (kalau ada) — penting untuk reschedule, karena `open`
  // bisa berubah dari false → true berkali-kali dengan initialType yang
  // berbeda-beda tiap kali, sementara `selectedType` di useState hanya
  // dievaluasi sekali saat komponen pertama kali mount.
  useEffect(() => {
    if (open) {
      setSelectedType(initialType || SCHEDULE_TYPES[0].value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialType]);

  // Load kandidat setiap kali tipe berubah
  useEffect(() => {
    if (!open) return;
    setCheckedIds([]);
    loadApplicants(selectedType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selectedType]);

  const loadApplicants = async (type) => {
    try {
      setLoadingApplicants(true);
      const res = await fetchApplicantsByStage(type);
      let list = res.items || [];

      // ✅ BARU: kalau ada kandidat yang mau di-preselect (alur reschedule)
      // dan tipe yang sedang dimuat cocok dengan tipe reschedule tsb,
      // pastikan kandidat itu langsung ter-centang. Kalau karena suatu
      // sebab kandidatnya tidak muncul di hasil fetch (mis. delay data
      // di backend), kita sisipkan manual supaya tetap terlihat & bisa
      // langsung dijadwalkan ulang tanpa mencari manual.
      if (
        preselectedApplicant?.applicationId &&
        type === (initialType || type)
      ) {
        const alreadyInList = list.some(
          (a) => a.applicationId === preselectedApplicant.applicationId
        );
        if (!alreadyInList) {
          list = [
            {
              applicationId: preselectedApplicant.applicationId,
              applicantName: preselectedApplicant.applicantName || "Kandidat",
              position: preselectedApplicant.position || "-",
              avatar: preselectedApplicant.avatar || null,
            },
            ...list,
          ];
        }
        setCheckedIds([preselectedApplicant.applicationId]);
      }

      setApplicants(list);
    } catch {
      toast.error("Gagal memuat kandidat");
    } finally {
      setLoadingApplicants(false);
    }
  };

  const toggleCheck = (id) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (checkedIds.length === applicants.length) {
      setCheckedIds([]);
    } else {
      setCheckedIds(applicants.map((a) => a.applicationId));
    }
  };

  const handleNextFromCandidates = () => {
    if (checkedIds.length === 0) {
      toast.error("Pilih minimal satu kandidat");
      return;
    }
    setStep(2);
  };

  const handleNextFromLocation = () => setStep(3);
  const handleBackToCandidates = () => setStep(1);
  const handleBackToLocation = () => setStep(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date || !form.time) {
      toast.error("Tanggal dan waktu harus diisi");
      return;
    }

    // Validasi H+1 di sisi client sebagai lapisan tambahan
    // (validasi utama tetap di server / assertDateIsHPlusOne)
    if (form.date < getTomorrowDateString()) {
      toast.error("Tanggal jadwal minimal H+1 (besok), tidak bisa hari ini");
      return;
    }

    const { location: locationText, meetingLink } = buildLocationPayload(location);
    if (!locationText) {
      toast.error("Lokasi belum lengkap");
      return;
    }

    try {
      setSubmitting(true);
      const result = await bulkCreateSchedule({
        applicationIds: checkedIds,
        type: selectedType,
        date: form.date,
        time: form.time,
        durationMin: 60,
        location: locationText,
        meetingLink,
      });

      const newScheduleCreatedSuccessfully = (result.created || 0) > 0;

      if (result.errors?.length > 0) {
        toast.error(`${result.created} jadwal dibuat, ${result.errors.length} gagal (mungkin sudah ada)`);
      } else {
        toast.success(`${result.created} jadwal berhasil dibuat`);
      }

      // ✅ BARU: hapus jadwal lama HANYA setelah jadwal baru terbukti
      // berhasil dibuat. Kalau bulkCreateSchedule gagal total (exception
      // di atas akan menangkapnya duluan lewat catch), atau kalau semua
      // kandidat gagal (result.created === 0, mis. semua konflik jadwal),
      // jadwal lama TIDAK disentuh — supaya tidak ada kondisi di mana
      // jadwal lama sudah hilang tapi jadwal baru gagal terbentuk.
      if (scheduleIdToReplace && newScheduleCreatedSuccessfully) {
        try {
          await deleteSchedule(scheduleIdToReplace);
        } catch (delErr) {
          // Jadwal baru sudah berhasil dibuat, tapi penghapusan jadwal
          // lama gagal (mis. sudah terhapus duluan / race condition).
          // Jangan gagalkan keseluruhan alur karena ini — cukup beri
          // tahu, supaya admin bisa hapus manual kalau perlu.
          toast.error(
            delErr?.response?.data?.message ||
              "Jadwal baru berhasil dibuat, tapi jadwal lama gagal dihapus otomatis. Silakan hapus manual."
          );
        }
      }

      resetAll();
      onClose();
      onCreated?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Gagal membuat jadwal");
    } finally {
      setSubmitting(false);
    }
  };

  const resetAll = () => {
    setStep(1);
    setCheckedIds([]);
    setLocation(INITIAL_LOCATION);
    setForm({ date: "", time: "" });
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const selectedTypeLabel = SCHEDULE_TYPES.find((t) => t.value === selectedType)?.label || "";
  const allChecked = applicants.length > 0 && checkedIds.length === applicants.length;

  if (!open) return null;

  const modalWidthClass = step === 2 ? "max-w-2xl" : "max-w-md";

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-3 sm:p-4">
      <div
        className={`bg-white rounded-xl shadow-lg w-full ${modalWidthClass} p-4 sm:p-6 transition-all max-h-[92vh] overflow-y-auto`}
      >

        {/* Header */}
        <div className="flex justify-between items-center mb-1 gap-3">
          <h2 className="text-lg font-bold">
            {step === 2 ? "Pilih Lokasi Pertemuan" : "Buat Jadwal"}
          </h2>
          <button onClick={handleClose} className="shrink-0">
            <X className="h-5 w-5 text-gray-500 hover:text-sky-800" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          {step === 1 && "Pilih tipe dan kandidat yang akan dijadwalkan"}
          {step === 2 && "Tentukan kantor dan ruangan, atau atur pertemuan daring"}
          {step === 3 && `Atur waktu untuk ${checkedIds.length} kandidat`}
        </p>

        {/* Step indicator — bisa discroll horizontal di layar sangat sempit */}
        <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
          {STEP_LABELS.map((label, i) => (
            <React.Fragment key={i}>
              <div
                className={`flex items-center gap-1.5 text-[11px] sm:text-xs font-medium whitespace-nowrap shrink-0 ${
                  step === i + 1 ? "text-sky-600" : step > i + 1 ? "text-green-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0
                  ${step === i + 1 ? "bg-sky-600 text-white" : step > i + 1 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}
                >
                  {i + 1}
                </div>
                {label}
              </div>
              {i < STEP_LABELS.length - 1 && <div className="flex-1 min-w-[16px] h-px bg-gray-200" />}
            </React.Fragment>
          ))}
        </div>

        {/* STEP 1: Pilih tipe + kandidat */}
        {step === 1 && (
          <div className="space-y-4">
            {/* Tab tipe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Jadwal</label>
              <div className="flex bg-gray-100 rounded-lg p-1 gap-1 overflow-x-auto">
                {SCHEDULE_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setSelectedType(t.value)}
                    className={`flex-1 min-w-[90px] px-2 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap
                      ${selectedType === t.value
                        ? "bg-white text-sky-700 shadow-sm font-semibold"
                        : "text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Daftar kandidat dengan checkbox */}
            <div>
              <div className="flex justify-between items-center mb-2 gap-2">
                <label className="block text-sm font-medium text-gray-700">
                  Kandidat <span className="text-gray-400 font-normal">({applicants.length} tersedia)</span>
                </label>
                {applicants.length > 0 && (
                  <button type="button" onClick={toggleAll} className="text-xs text-sky-600 hover:underline shrink-0">
                    {allChecked ? "Batal semua" : "Pilih semua"}
                  </button>
                )}
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden max-h-56 overflow-y-auto">
                {loadingApplicants ? (
                  <div className="flex items-center justify-center gap-2 py-8 text-gray-400 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memuat kandidat...
                  </div>
                ) : applicants.length === 0 ? (
                  <div className="py-8 text-center text-sm text-gray-400 px-3">
                    Tidak ada kandidat di tahap <span className="font-medium text-gray-600">{selectedTypeLabel}</span>
                  </div>
                ) : (
                  applicants.map((a) => {
                    const checked = checkedIds.includes(a.applicationId);
                    return (
                      <label
                        key={a.applicationId}
                        className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors border-b border-gray-100 last:border-0
                          ${checked ? "bg-sky-50" : "hover:bg-gray-50"}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCheck(a.applicationId)}
                          className="hidden"
                        />
                        {checked
                          ? <CheckSquare className="h-4 w-4 text-sky-600 flex-shrink-0" />
                          : <Square className="h-4 w-4 text-gray-300 flex-shrink-0" />
                        }

                        {a.avatar ? (
                          <img src={a.avatar} alt="" className="h-8 w-8 rounded-full object-cover border border-gray-200 flex-shrink-0" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-gray-400" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${checked ? "text-sky-800" : "text-gray-800"}`}>
                            {a.applicantName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{a.position}</p>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>

              {checkedIds.length > 0 && (
                <p className="mt-1.5 text-xs text-sky-600 font-medium">
                  {checkedIds.length} kandidat dipilih
                </p>
              )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
              <button type="button" onClick={handleClose}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 text-sm w-full sm:w-auto">
                Batal
              </button>
              <button type="button" onClick={handleNextFromCandidates}
                className="px-4 py-2 rounded-lg text-white bg-sky-600 hover:bg-sky-700 text-sm font-medium w-full sm:w-auto">
                Lanjut →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Pilih Lokasi */}
        {step === 2 && (
          <LocationStep
            value={location}
            onChange={setLocation}
            onNext={handleNextFromLocation}
            onBack={handleBackToCandidates}
          />
        )}

        {/* STEP 3: Atur tanggal & waktu */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Ringkasan kandidat + lokasi terpilih */}
            <div className="bg-sky-50 border border-sky-200 rounded-lg px-3 py-2 text-sm text-sky-800 space-y-1">
              <p>
                <span className="font-semibold">{checkedIds.length} kandidat</span> akan dijadwalkan untuk{" "}
                <span className="font-semibold">{selectedTypeLabel}</span>
              </p>
              <p className="flex items-start gap-1.5 text-sky-700">
                {location.meetingMode === "online" ? (
                  <Video className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                ) : (
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                )}
                <span className="break-words">{locationSummaryLabel(location)}</span>
              </p>
            </div>

            {/* Tanggal + Waktu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={form.date}
                    min={getTomorrowDateString()}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="border border-gray-300 shadow-sm rounded-lg px-3 py-2 text-sm w-full pl-9 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Waktu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="border border-gray-300 shadow-sm rounded-lg px-3 py-2 text-sm w-full pl-9 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
                  />
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-2">
              <button type="button" onClick={handleBackToLocation}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 text-sm w-full sm:w-auto">
                ← Kembali
              </button>
              <button type="submit" disabled={submitting}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white bg-sky-600 hover:bg-sky-700 text-sm font-medium disabled:opacity-60 w-full sm:w-auto">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Jadwalkan
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}