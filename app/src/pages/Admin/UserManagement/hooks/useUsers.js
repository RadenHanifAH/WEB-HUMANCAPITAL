import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../../../api/axiosInstance";

export default function useUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });
  const [filters, setFilters] = useState({ search: "", role: "all", divisi: "all", status: "all" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      // ✅ tanpa prefix /api, karena axiosInstance baseURL sudah "http://localhost:4000/api"
      const { data } = await axiosInstance.get("/users", {
        params: { ...filters, page, limit: pagination.limit },
      });
      setUsers(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat data user.");
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit]);

  useEffect(() => {
    fetchUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const deleteUser = async (id) => {
    await axiosInstance.delete(`/users/${id}`);
    await fetchUsers(pagination.page);
  };

  // ✅ Export via fetch + blob, BUKAN window.open().
  // axiosInstance Anda pakai Bearer token dari localStorage (bukan cookie
  // session), sedangkan window.open() membuka tab baru yang TIDAK membawa
  // header Authorization apapun — request itu akan langsung kena 401.
  // Dengan axiosInstance.get(..., { responseType: "blob" }), interceptor
  // request tetap jalan dan menempelkan token dengan benar.
  const exportUsers = async () => {
    setExporting(true);
    try {
      const response = await axiosInstance.get("/users/export", {
        params: filters,
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "user-management.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.response?.data?.message || "Gagal export data.");
    } finally {
      setExporting(false);
    }
  };

  return {
    users,
    pagination,
    filters,
    setFilters,
    loading,
    error,
    exporting,
    fetchUsers,
    deleteUser,
    exportUsers,
  };
}