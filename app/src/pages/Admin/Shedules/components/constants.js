import React from "react";

// ───────────────────────────────────────────────────────────────────────────
// Catatan penting:
// `value` (InterviewHC, Psikotes, FinalInterview) tetap dipertahankan
// karena nilainya sudah tersimpan di kolom `type` pada tabel
// `interviewschedule` di database. Yang diubah HANYA label tampilan:
//   - InterviewHC     → "Interview Pertama"
//   - Psikotes        → "Psikotes"            (tidak berubah)
//   - FinalInterview  → "Interview Kedua"
// ───────────────────────────────────────────────────────────────────────────

export const ITEMS_PER_PAGE = 5;

export const SCHEDULE_TYPES = [
  { value: "InterviewHC", label: "Interview Pertama" },
  { value: "Psikotes", label: "Psikotes" },
  { value: "FinalInterview", label: "Interview Kedua" },
];

export function typeLabel(type) {
  const found = SCHEDULE_TYPES.find((t) => t.value === type);
  return found ? found.label : type;
}

export function getColorsForType(type) {
  switch (type) {
    case "InterviewHC":
      return {
        cardBg: "bg-white border-gray-200",
        badgeBg: "bg-sky-100",
        badgeText: "text-sky-700",
      };
    case "Psikotes":
      return {
        cardBg: "bg-white border-gray-200",
        badgeBg: "bg-purple-100",
        badgeText: "text-purple-700",
      };
    case "FinalInterview":
      return {
        cardBg: "bg-white border-gray-200",
        badgeBg: "bg-amber-100",
        badgeText: "text-amber-700",
      };
    default:
      return {
        cardBg: "bg-white border-gray-200",
        badgeBg: "bg-gray-100",
        badgeText: "text-gray-700",
      };
  }
}

// Attendance status values used on interviewschedule items.
// "pending"     -> HR has not yet marked attendance (shows Set Hadir / Set Tidak Hadir)
// "hadir"       -> candidate attended
// "tidak_hadir" -> candidate did not attend (shows reason panel)
export const ATTENDANCE = {
  PENDING: "pending",
  HADIR: "hadir",
  TIDAK_HADIR: "tidak_hadir",
};

// ── Data kantor ───────────────────────────────────────────────────────────
// TODO: pindahkan ke database / endpoint /offices jika perlu dikelola dinamis
export const OFFICES = [
  {
    id: "syaamil-quran",
    tag: "PUSAT",
    name: "Syaamil Quran",
    address: "Jl. Babakan Sari No.71, Babakan Sari, Kec. Kiaracondong, Kota Bandung",
  },
  {
    id: "branch-syaamil",
    tag: "CABANG",
    name: "Branch Syaamil Quran Jakarta",
    address: "Jl. Komp. DDN Curug No.75, RT.12/RW.8, Pd. Klp., Kec. Duren Sawit, Kota Jakarta Timur",
  },
  {
    id: "syaamil-surabaya",
    tag: "CABANG",
    name: "Syaamil Quran Surabaya",
    address: "Blok I no.18, Perum Jl. Bendul Merisi Permai, Bendul Merisi, Kec. Wonocolo, Surabaya",
  },
];

// ── Helper: ubah state lokasi jadi payload siap kirim ke backend ─────────
export function buildLocationPayload(locationState) {
  const { meetingMode, officeId, onlineLink } = locationState;

  if (meetingMode === "online") {
    return {
      location: "Online Meeting (Zoom/Google Meet)",
      meetingLink: onlineLink.trim(),
    };
  }

  const office = OFFICES.find((o) => o.id === officeId);

  return {
    location: office ? `${office.name} - ${office.address}` : "",
    meetingLink: null,
  };
}

// ── Helper: label ringkas untuk ditampilkan di step berikutnya ───────────
export function locationSummaryLabel(locationState) {
  const { meetingMode, officeId, onlineLink } = locationState;
  if (meetingMode === "online") {
    return onlineLink ? `Online — ${onlineLink}` : "Online Meeting";
  }
  const office = OFFICES.find((o) => o.id === officeId);
  if (office) return `${office.name} — ${office.address}`;
  return "Belum dipilih";
}