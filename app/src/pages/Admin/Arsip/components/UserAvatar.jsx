import React, { useMemo, useState } from "react";
import { User } from "lucide-react";

export default function UserAvatar({
  fotoProfile,
  alt = "Foto Profil",
  className = "w-10 h-10",
}) {
  const [broken, setBroken] = useState(false);

  const src = useMemo(() => {
    if (!fotoProfile) return null;
    const val = String(fotoProfile).trim();
    return val ? val : null;
  }, [fotoProfile]);

  const showFallback = !src || broken;

  if (showFallback) {
    return (
      <div
        className={`${className} rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center flex-shrink-0`}
        aria-label={alt}
        title={alt}
      >
        <User className="w-5 h-5 text-gray-500" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} rounded-full object-cover border-2 border-sky-100 flex-shrink-0`}
      onError={() => setBroken(true)}
    />
  );
}
