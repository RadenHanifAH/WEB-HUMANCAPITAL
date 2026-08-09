// src/hooks/useProfileSections.js
import { useState, useEffect, useCallback } from "react";
import * as api from "../api/profileSections";

export const useProfileSections = () => {
  const [data, setData] = useState({
    workExperiences: [],
    educations: [],
    organizations: [],
    certificates: [],
    skills: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const full = await api.fetchFullProfile();
      setData(full);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
};