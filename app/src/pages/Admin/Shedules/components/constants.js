export const ITEMS_PER_PAGE = 3;

export const interviewTypes = [
  { value: "InterviewHC", label: "Interview HC" },
  { value: "FinalInterview", label: "Final Interview" },
  { value: "Psikotes", label: "Psikotes" },
];

export function getColorsForType(type) {
  const neutralCardStyle = { cardBg: "bg-white border-gray-300" };

  switch (type) {
    case "InterviewHC":
      return { ...neutralCardStyle, badgeBg: "bg-blue-200", badgeText: "text-blue-700" };
    case "FinalInterview":
      return { ...neutralCardStyle, badgeBg: "bg-green-200", badgeText: "text-green-700" };
    case "Psikotes":
      return { ...neutralCardStyle, badgeBg: "bg-purple-200", badgeText: "text-purple-700" };
    default:
      return { ...neutralCardStyle, badgeBg: "bg-gray-100", badgeText: "text-gray-700" };
  }
}

export function typeLabel(type) {
  const m = {
    InterviewHC: "Interview HC",
    FinalInterview: "Final Interview",
    Psikotes: "Psikotes",
  };
  return m[type] || type;
}
