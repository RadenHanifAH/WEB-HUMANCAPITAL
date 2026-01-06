import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_BASE_URL, chartColors20, periodOptions } from "../utils/constants";

export function useReportsDashboard() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // 3 dropdown berbeda
  const [trendPeriod, setTrendPeriod] = useState(periodOptions[2]); // monthly
  const [positionPeriod, setPositionPeriod] = useState(periodOptions[2]); // monthly
  const [statusPeriod, setStatusPeriod] = useState(periodOptions[2]); // monthly

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

      // 1) TREND
      const resTrend = await axios.get(`${API_BASE_URL}/charts?period=${trendPeriod.id}`);
      setTrendData(resTrend.data?.chartTrend || { labels: [], applications: [] });

      // 2) STATUS
      const resStatus = await axios.get(`${API_BASE_URL}/charts?period=${statusPeriod.id}`);
      setAcceptanceData({
        labels: resStatus.data?.chartAcceptance?.labels || [],
        values: resStatus.data?.chartAcceptance?.values || [],
      });

      // 3) LOWONGAN/POSISI
      const resPos = await axios.get(`${API_BASE_URL}/metrics?period=${positionPeriod.id}`);
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
  }, [trendPeriod, positionPeriod, statusPeriod]);

  // helper buat export URL params
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
