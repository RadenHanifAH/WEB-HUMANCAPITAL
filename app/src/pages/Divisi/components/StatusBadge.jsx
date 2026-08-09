const statusConfig = {
  APPROVED: {
    label: "Approved",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  PENDING: {
    label: "Pending",
    className: "bg-yellow-50  text-yellow-700  border border-yellow-200",
  },
  DRAFT: {
    label: "Draft",
    className: "bg-gray-100   text-gray-500    border border-gray-200",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-50     text-red-600     border border-red-200",
  },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status?.toUpperCase()] || {
    label: status,
    className: "bg-gray-100 text-gray-500",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide ${config.className}`}
    >
      {config.label}
    </span>
  );
}
