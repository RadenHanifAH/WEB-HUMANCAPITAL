import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../../../api/axiosInstance";
import { API_APPLICANTS, API_JOBS } from "../utils/constants";

export const usePelamar = () => {
  const [applicants, setApplicants] = useState([]);
  const [jobPositions, setJobPositions] = useState([{ value: "", label: "Posisi" }]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJobPositions = useCallback(async () => {
    try {
      const res = await axiosInstance.get(API_JOBS);
      const data = res?.data?.data || res?.data || [];

      // ✅ FIX: Baca 'judul' (Prisma) atau fallback ke 'title' kalau ada
      const uniqueTitles = [
        ...new Set(
          (data || [])
            .map((job) => job.judul || job.title)
            .filter(Boolean)
        ),
      ];

      setJobPositions([
        { value: "", label: "Posisi" },
        ...uniqueTitles.map((title) => ({ value: title, label: title })),
      ]);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchApplicants = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axiosInstance.get(API_APPLICANTS);
      const result = res?.data;
      setApplicants(result?.data || []);
    } catch (err) {
      setError(`Gagal memuat data: ${err?.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplicants();
    fetchJobPositions();
  }, [fetchApplicants, fetchJobPositions]);

  return { applicants, setApplicants, jobPositions, loading, error, fetchApplicants };
};