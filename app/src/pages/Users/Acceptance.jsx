"use client";

import React, { useState } from "react";
import { Check, X, Calendar } from "lucide-react";

const initialApplicants = [
  { id: 1, name: "Budi Santoso", position: "Frontend Developer", status: "Menunggu", decisionDate: null },
  { id: 2, name: "Siti Aminah", position: "UI/UX Designer", status: "Menunggu", decisionDate: null },
  { id: 3, name: "Andi Pratama", position: "Backend Developer", status: "Menunggu", decisionDate: null },
];

export default function Acceptance() {
  const [applicants, setApplicants] = useState(initialApplicants);

  const handleDecision = (id, newStatus) => {
    setApplicants((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;

        if (a.status === newStatus) {
          return { ...a, status: "Menunggu", decisionDate: null };
        }

        return {
          ...a,
          status: newStatus,
          decisionDate: new Date().toLocaleDateString("id-ID"),
        };
      })
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Penerimaan Karyawan Baru</h1>
      <div className="overflow-x-auto bg-white shadow-md rounded-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-sky-800">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white">Nama</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white">Posisi</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white">Tanggal</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-white">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {applicants.map((a) => (
              <tr key={a.id}>
                <td className="px-6 py-3">{a.name}</td>
                <td className="px-6 py-3">{a.position}</td>
                <td className="px-6 py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium 
                      ${
                        a.status === "Diterima"
                          ? "bg-green-100 text-green-800"
                          : a.status === "Ditolak"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                  >
                    {a.status}
                  </span>
                </td>
                <td className="px-6 py-3 flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  {a.decisionDate || "-"}
                </td>
                <td className="px-6 py-3 text-center space-x-2">
                  <button
                    onClick={() => handleDecision(a.id, "Diterima")}
                    className={`inline-flex items-center px-3 py-1 rounded-lg text-white transition 
                      ${
                        a.status === "Diterima"
                          ? "bg-green-700"
                          : "bg-green-600 hover:bg-green-700"
                      }
                      ${a.status === "Ditolak" ? "opacity-50" : ""}
                    `}
                  >
                    <Check className="w-4 h-4 mr-1" /> Terima
                  </button>
                  <button
                    onClick={() => handleDecision(a.id, "Ditolak")}
                    className={`inline-flex items-center px-3 py-1 rounded-lg text-white transition 
                      ${
                        a.status === "Ditolak"
                          ? "bg-red-700"
                          : "bg-red-600 hover:bg-red-700"
                      }
                      ${a.status === "Diterima" ? "opacity-50" : ""}
                    `}
                  >
                    <X className="w-4 h-4 mr-1" /> Tolak
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
