import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_BASE_URL, chartColors20, periodOptions } from "../utils/constants";

export function useReportsDashboard() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const safeOpt = (i) => periodOptions?.[i] || periodOptions?.[0] || { id: "monthly", label: "Bulanan" };

  const [trendPeriod, setTrendPeriod] = useState(safeOpt(2));    // monthly
  const [positionPeriod, setPositionPeriod] = useState(safeOpt(2));
  const [statusPeriod, setStatusPeriod] = useState(safeOpt(2));

  const [trendData, setTrendData] = useState({ labels: [], applications: [] });
  const [acceptanceData, setAcceptanceData] = useState({ labels: [], values: [] });
  const [detailedPositions, setDetailedPositions] = useState([]);
  const [showFullPositionList, setShowFullPositionList] = useState(false);

  const dropdownState = useMemo(
    () => ({
      trendPeriod,
      positionPeriod,
      statusPeriod,
      setTrendPeriod,
      setPositionPeriod,
      setStatusPeriod,
    }),
    [trendPeriod, positionPeriod, statusPeriod]
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

  const fetchAll = async () => {
    try {
      setLoading(true);

      const [resTrend, resStatus, resPos] = await Promise.all([
        axios.get(`${API_BASE_URL}/charts?period=${trendPeriod.id}`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/charts?period=${statusPeriod.id}`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/metrics?period=${positionPeriod.id}`, { withCredentials: true }),
      ]);

      const trend = resTrend.data?.chartTrend || { labels: [], applications: [] };
      setTrendData({ labels: trend.labels || [], applications: trend.applications || [] });

      const acc = resStatus.data?.chartAcceptance || { labels: [], values: [] };
      setAcceptanceData({ labels: acc.labels || [], values: acc.values || [] });

      const positionDetails = resPos.data?.positionDetails || [];
      setDetailedPositions(
        positionDetails.map((p, idx) => ({
          ...p,
          color: chartColors20[idx % chartColors20.length],
        }))
      );
    } catch (err) {
      console.error("Fetch Error:", err);
      setTrendData({ labels: [], applications: [] });
      setAcceptanceData({ labels: [], values: [] });
      setDetailedPositions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trendPeriod?.id, positionPeriod?.id, statusPeriod?.id]);

  const exportParams = useMemo(
    () => ({
      trendPeriodId: trendPeriod.id,
      positionPeriodId: positionPeriod.id,
      statusPeriodId: statusPeriod.id,
    }),
    [trendPeriod.id, positionPeriod.id, statusPeriod.id]
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
