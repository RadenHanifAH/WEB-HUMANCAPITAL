import { useEffect, useMemo, useState, useCallback } from "react";
import axiosInstance from "../../../../api/axiosInstance";
import { API_REPORTS, chartColors20, periodOptions } from "../utils/constants";
import { toISORange } from "../utils/dateUtils";

const LS_KEYS = {
  granularity: "reports_trend_granularity",
  range: "reports_trend_range",
};

const defaultGranularity = periodOptions.find((g) => g.id === "monthly");

const getInitialGranularity = () => {
  try {
    const saved = localStorage.getItem(LS_KEYS.granularity);
    const found = periodOptions.find((g) => g.id === saved);
    if (found) return found;
  } catch (e) {
    void e;
  }
  return defaultGranularity;
};

const getInitialRange = () => {
  try {
    const saved = localStorage.getItem(LS_KEYS.range);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    void e;
  }
  return null; // null = belum ada custom range, pakai mode default
};

export function useReportsDashboard() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // trendPeriod di sini = granularitas aktif (harian/mingguan/bulanan/tahunan)
  const [trendPeriod, setTrendPeriod] = useState(() => getInitialGranularity());
  // dateRange = { start: "2024-01", end: "2025-11" } atau null jika belum di-custom
  const [dateRange, setDateRange] = useState(() => getInitialRange());

  const [trendData, setTrendData] = useState({ labels: [], applications: [] });
  const [acceptanceData, setAcceptanceData] = useState({ labels: [], values: [] });
  const [detailedPositions, setDetailedPositions] = useState([]);
  const [showFullPositionList, setShowFullPositionList] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEYS.granularity, trendPeriod?.id || "monthly");
    } catch (e) {
      void e;
    }
  }, [trendPeriod?.id]);

  useEffect(() => {
    try {
      if (dateRange) {
        localStorage.setItem(LS_KEYS.range, JSON.stringify(dateRange));
      } else {
        localStorage.removeItem(LS_KEYS.range);
      }
    } catch (e) {
      void e;
    }
  }, [dateRange]);

  const applyRange = useCallback((range) => setDateRange(range), []);
  const clearRange = useCallback(() => setDateRange(null), []);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);

      const granularityId = trendPeriod?.id || "monthly";

      // Susun params untuk trend chart: mode custom (rentang tanggal) vs mode biasa
      const trendParams = dateRange?.start && dateRange?.end
        ? { ...toISORange(dateRange.start, dateRange.end), granularity: granularityId }
        : { period: granularityId };

      const [resTrend, resStatus, resPos] = await Promise.all([
        axiosInstance.get(`${API_REPORTS}/charts`, { params: trendParams }),
        axiosInstance.get(`${API_REPORTS}/charts`, { params: { period: "monthly" } }),
        axiosInstance.get(`${API_REPORTS}/metrics`, { params: { period: "monthly" } }),
      ]);

      const trend = resTrend.data?.chartTrend || { labels: [], applications: [] };
      setTrendData({
        labels: Array.isArray(trend.labels) ? trend.labels : [],
        applications: Array.isArray(trend.applications) ? trend.applications : [],
      });

      const acc = resStatus.data?.chartAcceptance || { labels: [], values: [] };
      setAcceptanceData({
        labels: Array.isArray(acc.labels) ? acc.labels : [],
        values: Array.isArray(acc.values) ? acc.values : [],
      });

      const positionDetails = resPos.data?.positionDetails || [];
      const safeList = Array.isArray(positionDetails) ? positionDetails : [];

      const colors =
        Array.isArray(chartColors20) && chartColors20.length ? chartColors20 : ["#3B82F6"];

      setDetailedPositions(
        safeList.map((p, idx) => ({
          ...p,
          color: colors[idx % colors.length],
        }))
      );
    } catch (err) {
      console.error("Reports fetch error:", err);
      setTrendData({ labels: [], applications: [] });
      setAcceptanceData({ labels: [], values: [] });
      setDetailedPositions([]);
    } finally {
      setLoading(false);
    }
  }, [trendPeriod?.id, dateRange?.start, dateRange?.end]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const dropdownState = useMemo(
    () => ({
      trendPeriod,
      setTrendPeriod,
      dateRange,
      applyRange,
      clearRange,
    }),
    [trendPeriod, dateRange, applyRange, clearRange]
  );

  const dataState = useMemo(
    () => ({
      trendData,
      acceptanceData,
      detailedPositions,
      showFullPositionList,
      setShowFullPositionList,
    }),
    [trendData, acceptanceData, detailedPositions, showFullPositionList]
  );

  const exportParams = useMemo(() => {
    const base = { trendPeriodId: trendPeriod?.id || "monthly", fixedPeriod: "monthly" };
    if (dateRange?.start && dateRange?.end) {
      return { ...base, ...toISORange(dateRange.start, dateRange.end) };
    }
    return base;
  }, [trendPeriod?.id, dateRange?.start, dateRange?.end]);

  return {
    loading,
    exporting,
    setExporting,
    dropdownState,
    dataState,
    exportParams,
    refetch: fetchAll,
  };
}