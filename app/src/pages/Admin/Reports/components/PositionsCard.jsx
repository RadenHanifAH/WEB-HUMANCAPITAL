import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Card, CardContent } from "./Card";

function Progress({ value, color = "bg-blue-500" }) {
  return (
    <div className="relative w-full h-2 rounded-full bg-gray-200 overflow-hidden">
      <div
        className={`absolute h-full rounded-full ${color} transition-all duration-300`}
        style={{
          width: `${Math.max(0, Math.min(100, Number(value) || 0))}%`,
        }}
      />
    </div>
  );
}

export default function PositionsCard({
  detailedPositions,
  showFullPositionList,
  setShowFullPositionList,
}) {
  return (
    <Card>
      <div className="p-6 pb-2">
        <h3 className="text-lg font-semibold text-gray-800">Posisi Lamaran</h3>
        <p className="text-sm text-gray-500">
          Distribusi lamaran berdasarkan posisi (Bulanan)
        </p>
      </div>

      <CardContent>
        <div className="h-64 flex justify-center items-center">
          <Doughnut
            data={{
              labels: detailedPositions.map((p) => p.position),
              datasets: [
                {
                  data: detailedPositions.map((p) => p.count),
                  backgroundColor: detailedPositions.map((p) => p.color),
                  borderWidth: 0,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: "top" } },
            }}
          />
        </div>

        {showFullPositionList && (
          <div className="mt-4 space-y-2 pt-4">
            {detailedPositions.map((item) => (
              <div
                key={item.position}
                className="flex items-center text-sm p-2 bg-gray-50 rounded-md"
              >
                <div className="w-full max-w-[40%] flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate text-gray-800 font-medium">
                    {item.position}
                  </span>
                </div>

                <div className="w-24 text-center font-bold text-sky-600">
                  {item.count}
                </div>

                <div className="w-1/3 ml-4">
                  <Progress value={item.percentage} color="bg-sky-500" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <div className="p-4 flex justify-center">
        <button
          onClick={() => setShowFullPositionList((v) => !v)}
          className="text-sm font-medium text-sky-600 hover:text-sky-800 transition-colors"
        >
          {showFullPositionList ? "Sembunyikan Detail" : "Lihat Detail Lamaran"}
        </button>
      </div>
    </Card>
  );
}
