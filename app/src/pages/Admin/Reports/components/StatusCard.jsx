import React from "react";
import { Bar } from "react-chartjs-2";
import { Card, CardContent } from "./Card";

export default function StatusCard({ acceptanceData }) {
  return (
    <Card className="self-start">
      <div className="p-6 pb-2">
        <h3 className="text-lg font-semibold text-gray-800">Status Kandidat</h3>
        <p className="text-sm text-gray-500">
          Rekapitulasi status pelamar (Bulanan)
        </p>
      </div>

      <CardContent>
        <div className="h-64">
          <Bar
            data={{
              labels: acceptanceData?.labels || [],
              datasets: [
                {
                  label: "Jumlah",
                  data: acceptanceData?.values || [],
                  backgroundColor: ["#10b981", "#ef4444", "#f59e0b"],
                  borderRadius: 6,
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
