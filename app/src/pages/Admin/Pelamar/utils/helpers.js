import axiosInstance from "../../../../api/axiosInstance";

export const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  let dateToParse = dateStr;

  if (
    typeof dateStr === "string" &&
    dateStr.length === 10 &&
    dateStr.includes("-")
  ) {
    dateToParse = dateStr + "T00:00:00";
  }

  const date = new Date(dateToParse);
  if (isNaN(date.getTime())) return dateStr;

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getApiOrigin = () => {
  const base = axiosInstance?.defaults?.baseURL || "";
  try {
    // base: http://localhost:4000/api  -> origin: http://localhost:4000
    return new URL(base).origin;
  } catch {
    return "";
  }
};

export const downloadFileFromUrl = (url, filename = "file") => {
  if (!url) return;

  const origin = getApiOrigin();

  const finalUrl =
    url.startsWith("/") && origin ? `${origin}${url}` : url;

  if (finalUrl.startsWith("data:")) {
    const link = document.createElement("a");
    link.href = finalUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  window.open(finalUrl, "_blank", "noopener,noreferrer");
};

export const getProgress = (status) => {
  const s = String(status || "").trim();

  const stageProgress = {
    Screaning: 25,
    "Interview HC": 50,
    "Psikotes/Technical Test": 75,
    "Final Interview": 100,
    Accepted: 100,
  };

  if (s.toLowerCase().startsWith("rejected")) return 100;
  return stageProgress[s] || 0;
};
