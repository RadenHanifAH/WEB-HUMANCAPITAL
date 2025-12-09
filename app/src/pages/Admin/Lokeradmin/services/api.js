const API_URL = "http://localhost:4000/api/jobs";

export const fetchJobs = async () => {
  try {
    const res = await fetch(`${API_URL}?limit=9999`); // FIX agar ambil semua data
    if (!res.ok) return [];

    const data = await res.json();

    return (data.data || []).map((job) => ({
      ...job,
      applicants: job.applicants ?? 0,
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
