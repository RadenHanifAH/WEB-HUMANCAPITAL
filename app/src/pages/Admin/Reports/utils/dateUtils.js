// Catatan: opsi granularitas (Harian/Mingguan/Bulanan/Tahunan) sudah didefinisikan
// di utils/constants.js sebagai `periodOptions` — dipakai langsung di sana,
// tidak perlu diduplikasi di sini.

export const MONTHS_ID = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

export const MONTHS_ID_LONG = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

// input type="month" -> "2025-01"
export const parseMonthInput = (value) => {
  if (!value) return null;
  const [year, month] = value.split("-").map(Number);
  return { year, month }; // month: 1-12
};

export const formatMonthLabel = (value) => {
  const parsed = parseMonthInput(value);
  if (!parsed) return "";
  return `${MONTHS_ID[parsed.month - 1]} ${parsed.year}`;
};

export const formatRangeLabel = (start, end) => {
  if (!start || !end) return "Pilih Periode";
  return `${formatMonthLabel(start)} - ${formatMonthLabel(end)}`;
};

// Konversi "2025-01" (awal bulan) & "2025-06" (akhir bulan) menjadi ISO date string
// startDate = tanggal 1 di bulan awal, endDate = tanggal terakhir di bulan akhir
export const toISORange = (start, end) => {
  const s = parseMonthInput(start);
  const e = parseMonthInput(end);
  if (!s || !e) return { startDate: null, endDate: null };

  const startDate = new Date(s.year, s.month - 1, 1);
  const endDate = new Date(e.year, e.month, 0); // hari terakhir bulan akhir

  const toStr = (d) => d.toISOString().slice(0, 10);

  return { startDate: toStr(startDate), endDate: toStr(endDate) };
};

export const isRangeValid = (start, end) => {
  if (!start || !end) return false;
  return new Date(`${start}-01`) <= new Date(`${end}-01`);
};