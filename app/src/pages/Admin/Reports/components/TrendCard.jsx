import React from "react";
import { Bar } from "react-chartjs-2";
import { Card, CardContent } from "./Card";
import PeriodDropdown from "./PeriodDropdown";

export default function TrendCard({ trendPeriod, setTrendPeriod, trendData }) {
  return (
    <Card className="lg:col-span-2">
      <div className="flex justify-between items-center p-6 pb-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Trend Lamaran</h3>
          <p className="text-sm text-gray-500">{trendPeriod.label}</p>
        </div>
        <PeriodDropdown selected={trendPeriod} onChange={setTrendPeriod} />
      </div>

      <CardContent>
        <div className="h-64">
          <Bar
            key={trendPeriod.id}
            data={{
              labels: trendData.labels || [],
              datasets: [
                {
                  label: "Jumlah",
                  data: trendData.applications || [],
                  backgroundColor: "rgba(59, 130, 246, 0.8)",
                  borderRadius: 4,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: { y: { beginAtZero: true } },
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
