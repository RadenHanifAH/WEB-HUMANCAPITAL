import { useState, useEffect, useCallback } from "react";
import {
  getPengajuanList,
  deletePengajuan,
  submitPengajuan,
} from "../../api/divisiApi";

export function usePengajuan() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPengajuanList({
        search,
        status: statusFilter,
        page,
        limit,
      });
      setItems(res.data.data?.items || []);
      setTotal(res.data.data?.total || 0);
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal memuat data pengajuan");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id) => {
    await deletePengajuan(id);
    fetchData();
  };

  const handleSubmit = async (id) => {
    await submitPengajuan(id);
    fetchData();
  };

  const totalPages = Math.ceil(total / limit);

  return {
    items,
    total,
    loading,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    totalPages,
    refetch: fetchData,
    handleDelete,
    handleSubmit,
  };
}
