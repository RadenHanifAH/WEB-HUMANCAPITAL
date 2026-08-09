import React from "react";

const COLORS = [
  "bg-sky-100 text-sky-700",
  "bg-purple-100 text-purple-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
];

function colorFromName(name = "") {
  const idx = name.charCodeAt(0) % COLORS.length;
  return COLORS[idx] || COLORS[0];
}

export default function UserAvatar({ name, src }) {
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // ✅ Jika ada URL foto, tampilkan gambar
  if (src) {
    return (
      <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center border border-gray-100">
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = "none"; // Sembunyikan jika gambar rusak
          }}
        />
      </div>
    );
  }

  // ✅ Jika tidak ada, tampilkan inisial seperti biasa
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ${colorFromName(name)}`}>
      {initials}
    </div>
  );
}