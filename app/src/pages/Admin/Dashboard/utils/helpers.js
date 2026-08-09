// Untuk menampilkan badge status pelamar
export const getStatusClasses = (status) => {
  switch (status) {
    case "Screaning": return "bg-gray-200 text-gray-700";
    case "Interview Pertama": return "bg-blue-100 text-blue-800";
    case "Psikotes": return "bg-purple-100 text-purple-800";
    case "Interview Kedua": return "bg-green-100 text-green-800";
    default: return "bg-gray-200 text-gray-700";
  }
};

// Format nama menjadi inisial
export const getInitials = (name) => 
  name.split(" ").map(n => n[0]).join("").toUpperCase();