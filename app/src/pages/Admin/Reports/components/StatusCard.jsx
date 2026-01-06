import React from "react";
import { Bar } from "react-chartjs-2";
import { Card, CardContent } from "./Card";
import PeriodDropdown from "./PeriodDropdown";

export default function StatusCard({ statusPeriod, setStatusPeriod, acceptanceData }) {
  return (
    <Card className="self-start">
      <div className="flex justify-between items-center p-6 pb-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Status Kandidat</h3>
          <p className="text-sm text-gray-500">{statusPeriod.label}</p>
        </div>
        <PeriodDropdown selected={statusPeriod} onChange={setStatusPeriod} />
      </div>

      <CardContent>
        <div className="h-64">
          <Bar
            key={statusPeriod.id}
            data={{
              labels: acceptanceData.labels || [],
              datasets: [
                {
                  label: "Jumlah",
                  data: acceptanceData.values || [],
                  backgroundColor: ["#10b981", "#ef4444", "#f59e0b"],
                },
              ],
            }}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
