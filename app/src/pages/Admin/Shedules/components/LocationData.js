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