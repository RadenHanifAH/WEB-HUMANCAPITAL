const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;

const formatDiffValue = (val) => {
  if (val === null || val === undefined || val === "") return "(kosong)";
  if (typeof val === "boolean") return val ? "Ya" : "Tidak";
  if (typeof val === "number") return String(val);

  if (typeof val === "string") {
    // Deteksi tanggal ISO, misal "2026-09-29T00:00:00.000Z"
    if (ISO_DATE_RE.test(val)) {
      const d = new Date(val);
      if (!Number.isNaN(d.getTime())) {
        const isMidnightUTC =
          d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0;
        if (isMidnightUTC) {
          // Date-only (misal field tenggat) -> "29 Sep 2026"
          return new Intl.DateTimeFormat("id-ID", {
            day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
          }).format(d);
        }
        // Ada jam-nya -> "29 Sep 2026, 14.30"
        return new Intl.DateTimeFormat("id-ID", {
          day: "numeric", month: "short", year: "numeric",
          hour: "2-digit", minute: "2-digit", timeZone: "UTC",
        }).format(d);
      }
    }
    return val;
  }

  if (typeof val === "object") {
    try { return JSON.stringify(val); } catch { return "[objek]"; }
  }
  return String(val);
};

export default function ChangeDiff({ perubahan }) {
  if (!perubahan || !Array.isArray(perubahan) || perubahan.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-400">
        Tidak ada detail perubahan field yang tercatat.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {perubahan.map((change, idx) => {
        const isAdded = change.tipe === "added";
        const isRemoved = change.tipe === "removed";

        return (
          <div
            key={`${change.field}-${idx}`}
            className={`rounded-lg border p-3 ${
              isAdded ? "border-emerald-200 bg-emerald-50" : isRemoved ? "border-red-200 bg-red-50" : "border-slate-200 bg-white"
            }`}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {change.label || change.field}
              </span>
              {isAdded && <span className="rounded bg-emerald-200 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700">Baru</span>}
              {isRemoved && <span className="rounded bg-red-200 px-1.5 py-0.5 text-[10px] font-bold uppercase text-red-700">Dihapus</span>}
            </div>

            {isAdded ? (
              <div className="text-sm font-medium text-emerald-700">{formatDiffValue(change.ke)}</div>
            ) : isRemoved ? (
              <div className="text-sm text-red-600 line-through">{formatDiffValue(change.dari)}</div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex-1 rounded bg-red-50 px-3 py-1.5">
                  <span className="text-[10px] font-semibold uppercase text-red-400">Dari</span>
                  <div className="text-sm text-red-700 line-through">{formatDiffValue(change.dari)}</div>
                </div>
                <svg className="h-4 w-4 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <div className="flex-1 rounded bg-emerald-50 px-3 py-1.5">
                  <span className="text-[10px] font-semibold uppercase text-emerald-400">Ke</span>
                  <div className="text-sm font-medium text-emerald-700">{formatDiffValue(change.ke)}</div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}