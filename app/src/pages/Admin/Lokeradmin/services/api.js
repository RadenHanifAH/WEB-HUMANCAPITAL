const API_URL = "web-humancapital.railway.internal/api/jobs";

export const fetchJobs = async () => {
  try {
    // ✅ ADMIN harus isPublic=false agar tidak difilter status=active
    const res = await fetch(`${API_URL}?limit=9999&isPublic=false`, {
      credentials: "include",
    });

    if (!res.ok) return [];

    const data = await res.json();

    return (data.data || []).map((job) => ({
      ...job,
      applicants: job.applicants ?? 0, // ✅ ini harusnya sudah dikirim backend
    }));
  } catch (err) {
    console.error("Fetch Error:", err);
    return [];
  }
};

export const saveJob = async (jobData, id = null) => {
  const url = id ? `${API_URL}/${id}` : API_URL;
  const method = id ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(jobData),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const deleteJob = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error("Gagal menghapus lowongan.");
  return res.json();
};
