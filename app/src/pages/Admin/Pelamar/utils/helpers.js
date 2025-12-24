export const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  let dateToParse = dateStr;
  if (typeof dateStr === "string" && dateStr.length === 10 && dateStr.includes("-")) {
    dateToParse = dateStr + "T00:00:00";
  }
  const date = new Date(dateToParse);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("id-ID", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
};

export const downloadFileFromUrl = (url, filename) => {
  if (!url) return;
  const finalUrl = url.startsWith("/") ? `http://localhost:4000${url}` : url;
  if (finalUrl.startsWith("data:")) {
    const link = document.createElement("a");
    link.href = finalUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    window.open(finalUrl, "_blank");
  }
};

export const getProgress = (status) => {
  const stageProgress = {
    "under-review": 25, "interview-hc": 50, psikotes: 75, "final-interview": 100, accepted: 100,
  };
  if (status.startsWith("rejected-at-")) {
    const rejectionStage = status.split("-")[2];
    return stageProgress[rejectionStage] || 0;
  }
  return stageProgress[status] || 0;
};