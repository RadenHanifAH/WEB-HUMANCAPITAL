import { useEffect, useMemo, useState, useCallback } from "react";
import axiosInstance from "../../../../api/axiosInstance";
import { API_REPORTS, chartColors20, periodOptions } from "../utils/constants";

const LS_KEYS = { trend: "reports_period_trend" };
const defaultMonthly = { id: "monthly", label: "Bulanan" };

const findPeriodById = (id) => {
  const found = periodOptions.find((p) => p.id === id);
  return found || defaultMonthly;
};

const getInitialTrendPeriod = () => {
  try {
    const saved = localStorage.getItem(LS_KEYS.trend);
    if (saved) return findPeriodById(saved);
  } catch (e) {
    void e;
  }
  return defaultMonthly;
};

export function useReportsDashboard() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [trendPeriod, setTrendPeriod] = useState(() => getInitialTrendPeriod());

  const [trendData, setTrendData] = useState({ labels: [], applications: [] });
  const [acceptanceData, setAcceptanceData] = useState({ labels: [], values: [] });
  const [detailedPositions, setDetailedPositions] = useState([]);
  const [showFullPositionList, setShowFullPositionList] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEYS.trend, trendPeriod?.id || "monthly");
    } catch (e) {
      void e;
    }
  }, [trendPeriod?.id]);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);

      const trendId = trendPeriod?.id || "monthly";

      // ✅ axiosInstance: baseURL sudah /api, jadi cukup endpoint
      const [resTrend, resStatus, resPos] = await Promise.all([
        axiosInstance.get(`${API_REPORTS}/charts`, { params: { period: trendId } }),
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
        Array.isArray(chartColors20) && chartColors20.length
          ? chartColors20
          : ["#3B82F6"];

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
  }, [trendPeriod?.id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const dropdownState = useMemo(
    () => ({
      trendPeriod,
      setTrendPeriod,
    }),
    [trendPeriod]
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

  const exportParams = useMemo(
    () => ({
      trendPeriodId: trendPeriod?.id || "monthly",
      fixedPeriod: "monthly",
    }),
    [trendPeriod?.id]
  );

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
