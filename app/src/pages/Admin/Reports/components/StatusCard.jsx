import React from "react";
import { Bar } from "react-chartjs-2";
import { Card, CardContent } from "./Card";

// ✅ Warna per status — konsisten dengan yang ada di LamaranSayaSection.jsx
// dan di kolom warna_status (dummy_data_humancapital_v3.sql).
// Kalau backend menambah status baru yang belum ada di map, otomatis
// jatuh ke default abu-abu, jadi chart tidak crash.
const STATUS_COLOR_MAP = {
  Screaning: "#6c757d", // abu-abu netral
  InterviewPertama: "#0d6efd", // biru
  InterviewKedua: "#6610f2", // ungu
  Psikotes: "#fd7e14", // oranye
  Diterima: "#10b981", // hijau
  Ditolak: "#ef4444", // merah
};

const DEFAULT_COLOR = "#9ca3af";

const buildColors = (labels = []) =>
  labels.map((l) => STATUS_COLOR_MAP[l] || DEFAULT_COLOR);

export default function StatusCard({ acceptanceData }) {
  const labels = acceptanceData?.labels || [];
  const values = acceptanceData?.values || [];
  const colors = buildColors(labels);

  const total = values.reduce((acc, v) => acc + (Number(v) || 0), 0);

  return (
    <Card className="self-start">
      <div className="p-6 pb-2">
        <h3 className="text-lg font-semibold text-gray-800">Status Kandidat</h3>
        <p className="text-sm text-gray-500">
          Rekapitulasi status pelamar
          {total > 0 && (
            <span className="ml-1 text-gray-400">· {total} pelamar</span>
          )}
        </p>
      </div>

      <CardContent>
        <div className="h-64">
          {labels.length === 0 || total === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-gray-400">
              Tidak ada data pelamar.
            </div>
          ) : (
            <Bar
              data={{
                labels,
                datasets: [
                  {
                    label: "Jumlah",
                    data: values,
                    backgroundColor: colors,
                    borderRadius: 6,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (ctx) => {
                        const v = ctx.parsed?.y ?? 0;
                        const pct =
                          total > 0 ? ((v / total) * 100).toFixed(1) : "0.0";
                        return `${v} pelamar (${pct}%)`;
                      },
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { precision: 0, stepSize: 1 },
                  },
                },
              }}
            />
          )}
        </div>

        {/* Legenda manual supaya warna tiap tahap jelas */}
        {labels.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
            {labels.map((label, idx) => (
              <div key={label} className="flex items-center gap-1.5">
                <span
                  className="inline-block w-3 h-3 rounded-sm"
                  style={{ backgroundColor: colors[idx] }}
                />
                <span>{label}</span>
                <span className="font-semibold">{values[idx] ?? 0}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
