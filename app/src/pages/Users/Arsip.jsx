"use client"
import React, { useState } from "react"
import {
  Search,
  Trash2,
  Eye,
  Phone,
  Mail,
  Calendar,
  User,
  Building,
  Archive,
  ChevronDown,
  Check
} from "lucide-react"
import { Listbox } from "@headlessui/react"

// Data dummy
const mockEmployees = [
  {
    id: "1",
    name: "Budi Santoso",
    position: "Software Engineer",
    department: "IT",
    email: "budi@example.com",
    phone: "08123456789",
    hireDate: new Date("2022-05-20"),
  },
  {
    id: "2",
    name: "Siti Aminah",
    position: "UI/UX Designer",
    department: "Design",
    email: "siti@example.com",
    phone: "08987654321",
    hireDate: new Date("2023-06-15"),
  },
  {
    id: "3",
    name: "Andi Wijaya",
    position: "Data Analyst",
    department: "Business Intelligence",
    email: "andi@example.com",
    phone: "08213456789",
    hireDate: new Date("2024-02-10"),
  },
  {
    id: "4",
    name: "Rina Kurnia",
    position: "HR Specialist",
    department: "Human Resources",
    email: "rina@example.com",
    phone: "08765432109",
    hireDate: new Date("2025-08-01"),
  },
]

const monthOptions = [
  { value: "all", label: "Semua Bulan" },
  { value: "01", label: "Januari" },
  { value: "02", label: "Februari" },
  { value: "03", label: "Maret" },
  { value: "04", label: "April" },
  { value: "05", label: "Mei" },
  { value: "06", label: "Juni" },
  { value: "07", label: "Juli" },
  { value: "08", label: "Agustus" },
  { value: "09", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
]

const yearOptions = ["all", ...Array.from({ length: 21 }, (_, i) => (2025 + i).toString())]

function Arsip() {
  const [employees, setEmployees] = useState(mockEmployees)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState("all")
  const [selectedYear, setSelectedYear] = useState("all")

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatDate(employee.hireDate).toLowerCase().includes(searchTerm.toLowerCase())

    const empMonth = (employee.hireDate.getMonth() + 1).toString().padStart(2, "0")
    const empYear = employee.hireDate.getFullYear().toString()

    const matchesMonth = selectedMonth === "all" || empMonth === selectedMonth
    const matchesYear = selectedYear === "all" || empYear === selectedYear

    return matchesSearch && matchesMonth && matchesYear
  })

  const handleDelete = (id) => {
    if (confirm("Yakin ingin menghapus data ini?")) {
      setEmployees(employees.filter((emp) => emp.id !== id))
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Arsip Data Karyawan Diterima</h1>
        <p className="text-gray-600 mt-1">
          Arsip data karyawan yang diterima, diurutkan berdasarkan tanggal bergabung dari terbaru hingga terlama.
        </p>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white shadow rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Archive className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Arsip Karyawan</p>
            <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Karyawan Ditampilkan</p>
            <p className="text-2xl font-bold text-gray-900">{filteredEmployees.length}</p>
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari nama atau tanggal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </div>

        <Listbox value={selectedMonth} onChange={setSelectedMonth}>
          {({ open }) => (
            <div className="relative w-44">
              <Listbox.Button className="w-full flex justify-between items-center px-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm text-sm">
                <span>
                  {monthOptions.find((m) => m.value === selectedMonth)?.label || "Pilih Bulan"}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
              </Listbox.Button>
              <Listbox.Options className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 text-sm">
                {monthOptions.map((m) => (
                  <Listbox.Option key={m.value} value={m.value}>
                    {({ active, selected }) => (
                      <div
                        className={`px-3 py-2 flex justify-between items-center cursor-pointer rounded-md ${
                          active ? "bg-sky-100 text-sky-700" : "text-gray-700"
                        }`}
                      >
                        <span>{m.label}</span>
                        {selected && <Check className="w-4 h-4 text-sky-600" />}
                      </div>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          )}
        </Listbox>

        <Listbox value={selectedYear} onChange={setSelectedYear}>
          {({ open }) => (
            <div className="relative w-36">
              <Listbox.Button className="w-full flex justify-between items-center px-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm text-sm">
                <span>{selectedYear === "all" ? "Semua Tahun" : selectedYear}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
              </Listbox.Button>
              <Listbox.Options className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 text-sm">
                {yearOptions.map((y) => (
                  <Listbox.Option key={y} value={y}>
                    {({ active, selected }) => (
                      <div
                        className={`px-3 py-2 flex justify-between items-center cursor-pointer rounded-md ${
                          active ? "bg-sky-100 text-sky-700" : "text-gray-700"
                        }`}
                      >
                        <span>{y === "all" ? "Semua Tahun" : y}</span>
                        {selected && <Check className="w-4 h-4 text-sky-600" />}
                      </div>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          )}
        </Listbox>
      </div>

      {/* Daftar Arsip */}
      <div className="space-y-3">
        {filteredEmployees.length > 0 ? (
          filteredEmployees
            .sort((a, b) => b.hireDate.getTime() - a.hireDate.getTime())
            .map((employee) => (
              <div
                key={employee.id}
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 flex-1">
                    <div>
                      <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                      <p className="text-sm text-gray-600">{employee.position}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building className="w-4 h-4" />
                      <span>{employee.department}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{employee.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(employee.hireDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedEmployee(employee)
                      setShowDetail(true)
                    }}
                    className="p-2 border rounded-md hover:bg-gray-100"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(employee.id)}
                    className="p-2 border rounded-md hover:bg-gray-100 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
        ) : (
          <div className="bg-white p-8 text-center rounded-lg shadow">
            <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada arsip ditemukan</h3>
            <p className="text-gray-600">Coba ubah kata kunci atau filter tanggal.</p>
          </div>
        )}
      </div>

      {/* Modal Detail */}
      {showDetail && selectedEmployee && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Detail Karyawan</h2>
              <button onClick={() => setShowDetail(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{selectedEmployee.name}</h3>
                <p className="text-gray-600">{selectedEmployee.position}</p>
                <p className="text-sm text-gray-500">Bergabung: {formatDate(selectedEmployee.hireDate)}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" />{selectedEmployee.email}</div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" />{selectedEmployee.phone}</div>
              <div className="flex items-center gap-2"><Building className="w-4 h-4 text-gray-400" />{selectedEmployee.department}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Arsip
