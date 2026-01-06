export function downloadBlob(blobData, filename) {
  const url = window.URL.createObjectURL(new Blob([blobData]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function getFilenameFromContentDisposition(contentDisposition, fallback) {
  if (!contentDisposition) return fallback;
  const match = contentDisposition.match(/filename="(.+)"/);
  return match?.[1] || fallback;
}
