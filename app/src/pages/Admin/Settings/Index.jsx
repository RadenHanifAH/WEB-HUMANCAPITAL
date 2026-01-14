import React, { useState } from "react";

import Tabs from "./components/Tabs";
import Toast from "./components/Toast";

import GeneralSettings from "./components/GeneralSettings";
import ProfileSettings from "./components/ProfileSettings";
import NotificationSettings from "./components/NotificationSettings";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const props = { showToast };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 font-sans">
      <h1 className="text-2xl font-semibold text-sky-900 mb-6">
        Pengaturan
      </h1>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="p-0">
          {activeTab === "general" && <GeneralSettings {...props} />}
          {activeTab === "profile" && <ProfileSettings {...props} />}
          {activeTab === "notifications" && (
            <NotificationSettings {...props} />
          )}
        </div>
      </div>

      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
