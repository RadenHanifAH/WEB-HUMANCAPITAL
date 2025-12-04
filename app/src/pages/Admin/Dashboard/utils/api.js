const API_URL = "http://localhost:4000/api/dashboard/data";

export const fetchDashboardData = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error(`Gagal memuat data: ${response.statusText}`);
  return await response.json();
};
