/* eslint-disable no-unused-vars */
const colorMap = {
  blue: {
    bg: "bg-blue-50",
    icon: "text-blue-500",
    border: "border-l-blue-500",
  },
  yellow: {
    bg: "bg-yellow-50",
    icon: "text-yellow-500",
    border: "border-l-yellow-400",
  },
  green: {
    bg: "bg-emerald-50",
    icon: "text-emerald-500",
    border: "border-l-emerald-500",
  },
  red: {
    bg: "bg-red-50",
    icon: "text-red-400",
    border: "border-l-red-400",
  },
};

export default function StatCard({ icon: Icon, label, value, color }) {
  const c = colorMap[color] || colorMap.blue;

  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 border-l-4 ${c.border} p-4 flex items-center gap-4 shadow-sm`}
    >
      <div
        className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}
      >
        <Icon className={`w-5 h-5 ${c.icon}`} />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-800 leading-tight">
          {value}
        </p>
      </div>
    </div>
  );
}
