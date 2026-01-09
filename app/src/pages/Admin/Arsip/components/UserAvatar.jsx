import React, { useMemo, useState } from "react";

const PLACEHOLDER = "https://placehold.co/150";

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

  const finalSrc = !src || broken ? PLACEHOLDER : src;

  return (
    <img
      src={finalSrc}
      alt={alt}
      className={`${className} rounded-full object-cover border-2 border-sky-100 flex-shrink-0`}
      onError={() => setBroken(true)}
    />
  );
}
