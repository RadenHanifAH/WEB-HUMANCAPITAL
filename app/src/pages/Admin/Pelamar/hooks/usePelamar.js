import { useState, useEffect, useCallback } from "react";
import { API_URL_APPLICANTS, API_URL_JOBS } from "../utils/constants";

export const usePelamar = () => {
  const [applicants, setApplicants] = useState([]);
  const [jobPositions, setJobPositions] = useState([{ value: "", label: "Posisi" }]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJobPositions = async () => {
    try {
      const response = await fetch(API_URL_JOBS, { credentials: "include" });
      const data = await response.json();
      const jobData = data.data || data;
      const uniqueTitles = [...new Set(jobData.map((job) => job.title))];
      setJobPositions([
        { value: "", label: "Posisi" },
        ...uniqueTitles.map((title) => ({ value: title, label: title })),
      ]);
    } catch (err) { console.error(err); }
  };

  const fetchApplicants = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL_APPLICANTS, { credentials: "include" });
      const result = await response.json();
      setApplicants(result.data || []);
    } catch (err) {
      setError(`Gagal memuat data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplicants();
    fetchJobPositions();
  }, [fetchApplicants]);

  return { applicants, setApplicants, jobPositions, loading, error, fetchApplicants };
};