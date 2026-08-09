import { useState, useEffect, useCallback } from "react";
import { getDivisiDashboard } from "../../api/divisiApi";

export function useDivisiDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDivisiDashboard();
      const payload = res.data?.data ?? res.data ?? null;
      setData(payload);
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
