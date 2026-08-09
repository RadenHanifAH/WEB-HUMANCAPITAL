import React from "react";
import { Line } from "react-chartjs-2";
import { Menu } from "lucide-react";
import { Card, CardContent } from "./Card";
import PeriodDropdown from "./PeriodDropdown";
import DateRangePicker from "./DateRangePicker";
import { periodOptions } from "../utils/constants";

export default function TrendCard({
  trendPeriod,
  setTrendPeriod,
  trendData,
  dateRange,
  onApplyRange,
  onClearRange,
}) {
  const isCustomActive = Boolean(dateRange?.start && dateRange?.end);

  return (
    <Card className="lg:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3 p-6 pb-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Tren Analisis Lamaran</h3>
          <p className="text-sm text-gray-500">Pergerakan Data</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Segmented control muncul selalu; kalau custom range aktif, ini mengatur
              granularitas (harian/mingguan/bulanan/tahunan) di dalam rentang tsb */}
          <PeriodDropdown
            selected={trendPeriod}
            onChange={setTrendPeriod}
            options={periodOptions}
          />

          <DateRangePicker
            range={dateRange}
            onApply={onApplyRange}
            onClear={onClearRange}
          />

          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isCustomActive && (
        <p className="px-6 text-xs text-sky-600">
          Menampilkan data {trendPeriod.label.toLowerCase()} untuk periode custom yang dipilih.
        </p>
      )}

      <CardContent>
        <div className="h-72">
          <Line
            key={`${trendPeriod.id}-${dateRange?.start || ""}-${dateRange?.end || ""}`}
            data={{
              labels: trendData.labels || [],
              datasets: [
                {
                  label: "Jumlah Lamaran",
                  data: trendData.applications || [],
                  borderColor: "#2563eb",
                  borderWidth: 3,
                  tension: 0.4,
                  fill: true,
                  backgroundColor: (context) => {
                    const { ctx, chartArea } = context.chart;
                    if (!chartArea) return "rgba(37, 99, 235, 0.15)";
                    const gradient = ctx.createLinearGradient(
                      0,
                      chartArea.top,
                      0,
                      chartArea.bottom
                    );
                    gradient.addColorStop(0, "rgba(37, 99, 235, 0.35)");
                    gradient.addColorStop(1, "rgba(37, 99, 235, 0)");
                    return gradient;
                  },
                  pointRadius: (context) => {
                    const total = context.chart.data.labels.length;
                    return context.dataIndex === total - 1 ? 5 : 0;
                  },
                  pointHoverRadius: 5,
                  pointBackgroundColor: "#ffffff",
                  pointBorderColor: "#2563eb",
                  pointBorderWidth: 2,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: "#0f172a",
                  padding: 10,
                  cornerRadius: 8,
                },
              },
              scales: {
                x: {
                  grid: { display: false },
                  ticks: { color: "#d97706", font: { size: 11 } },
                },
                y: {
                  border: { dash: [4, 4] },
                  grid: { color: "#e5e7eb" },
                  ticks: {
                    color: "#0d9488",
                    font: { size: 11 },
                    callback: (value) => value.toFixed(2),
                  },
                },
              },
              interaction: { intersect: false, mode: "index" },
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}