import React from "react";

export default function Tabs({ activeTab, setActiveTab }) {
  const tabs = [
    { key: "general", label: "Umum" },
    { key: "profile", label: "Profile" },
    { key: "notifications", label: "Notifikasi" },
  ];

  return (
    <div className="border-b border-gray-200">
      <div className="flex flex-wrap text-sm font-medium text-center text-gray-500">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 px-4 py-3 transition-colors focus:outline-none ${
              activeTab === t.key
                ? "border-b-2 border-sky-600 text-sky-600"
                : "hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
