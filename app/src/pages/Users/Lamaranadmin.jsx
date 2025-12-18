// // src/components/Lamaranadmin.jsx
// import React, { useState } from "react";
// import {
//   Eye,
//   CheckCircle,
//   XCircle,
//   FileText,
//   Search,
//   ChevronDown,
//   Check,
// } from "lucide-react";
// import { Listbox } from "@headlessui/react";

// const applicationsData = [
//   {
//     id: 1,
//     applicantName: "Ahmad Rizki Pratama",
//     applicantEmail: "ahmad.rizki@email.com",
//     jobTitle: "Frontend Developer",
//     department: "Engineering",
//     location: "Jakarta",
//     appliedDate: "2024-01-15",
//     status: "pending",
//     avatar: "https://i.pravatar.cc/40?img=1",
//   },
//   {
//     id: 2,
//     applicantName: "Sari Indah Permata",
//     applicantEmail: "sari.indah@email.com",
//     jobTitle: "UI/UX Designer",
//     department: "Design",
//     location: "Bandung",
//     appliedDate: "2024-01-12",
//     status: "reviewed",
//     avatar: "https://i.pravatar.cc/40?img=2",
//   },
//   {
//     id: 3,
//     applicantName: "Budi Santoso",
//     applicantEmail: "budi.santoso@email.com",
//     jobTitle: "Backend Developer",
//     department: "Engineering",
//     location: "Surabaya",
//     appliedDate: "2024-01-10",
//     status: "approved",
//     avatar: "https://i.pravatar.cc/40?img=3",
//   },
//   {
//     id: 4,
//     applicantName: "Maya Putri Sari",
//     applicantEmail: "maya.putri@email.com",
//     jobTitle: "Product Manager",
//     department: "Product",
//     location: "Jakarta",
//     appliedDate: "2024-01-08",
//     status: "rejected",
//     avatar: "https://i.pravatar.cc/40?img=4",
//   },
// ];

// function Lamaranadmin() {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [departmentFilter, setDepartmentFilter] = useState("all");

//   const filteredApplications = applicationsData.filter((app) => {
//     const matchesSearch =
//       app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       app.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase());

//     const matchesStatus = statusFilter === "all" || app.status === statusFilter;
//     const matchesDept =
//       departmentFilter === "all" || app.department === departmentFilter;

//     return matchesSearch && matchesStatus && matchesDept;
//   });

//   const renderStatus = (status) => {
//     switch (status) {
//       case "pending":
//         return (
//           <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs">
//             Menunggu Review
//           </span>
//         );
//       case "reviewed":
//         return (
//           <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs">
//             Sudah Direview
//           </span>
//         );
//       case "approved":
//         return (
//           <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs">
//             Disetujui
//           </span>
//         );
//       case "rejected":
//         return (
//           <span className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs">
//             Ditolak
//           </span>
//         );
//       default:
//         return status;
//     }
//   };

//   return (
//     <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
//       <h1 style={{ marginBottom: "20px" }}>Manajemen Lamaran</h1>

//       {/* Stats Cards */}
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(4,1fr)",
//           gap: "20px",
//           marginBottom: "30px",
//         }}
//       >
//         <div className="relative border border-gray-200 rounded-lg p-4">
//           <FileText className="absolute top-3 right-3 text-gray-500" />
//           <h3>Total Lamaran</h3>
//           <p className="text-2xl font-bold">1,234</p>
//           <small>Semua lamaran</small>
//         </div>
//         <div className="relative border border-gray-200 rounded-lg p-4">
//           <Eye className="absolute top-3 right-3 text-yellow-500" />
//           <h3>Menunggu Review</h3>
//           <p className="text-2xl font-bold">89</p>
//           <small>Perlu ditindaklanjuti</small>
//         </div>
//         <div className="relative border border-gray-200 rounded-lg p-4">
//           <CheckCircle className="absolute top-3 right-3 text-green-500" />
//           <h3>Disetujui</h3>
//           <p className="text-2xl font-bold">456</p>
//           <small>Lanjut ke seleksi</small>
//         </div>
//         <div className="relative border border-gray-200 rounded-lg p-4">
//           <XCircle className="absolute top-3 right-3 text-red-500" />
//           <h3>Ditolak</h3>
//           <p className="text-2xl font-bold">123</p>
//           <small>Tidak memenuhi syarat</small>
//         </div>
//       </div>

//       {/* Filter */}
//       <div className="flex justify-between items-center mb-6 gap-3">
//         {/* Search */}
//         <div className="relative flex-1 max-w-md">
//           <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
//           <input
//             type="text"
//             placeholder="Cari pelamar, posisi, atau email..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
//           />
//         </div>

//         {/* Filter dengan Listbox */}
//         <div className="flex gap-2">
//           {/* Status Filter */}
//           <Listbox value={statusFilter} onChange={setStatusFilter}>
//             {({ open }) => (
//               <div className="relative w-44">
//                 <Listbox.Button className="w-full flex justify-between items-center px-3 py-2 border border-gray-200 rounded-lg bg-white shadow-sm text-left text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
//                   <span>
//                     {statusFilter === "all"
//                       ? "Semua Status"
//                       : statusFilter === "pending"
//                       ? "Menunggu Review"
//                       : statusFilter === "reviewed"
//                       ? "Sudah Direview"
//                       : statusFilter === "approved"
//                       ? "Disetujui"
//                       : statusFilter === "rejected"
//                       ? "Ditolak"
//                       : statusFilter}
//                   </span>
//                   <ChevronDown
//                     className={`w-4 h-4 text-gray-500 ml-1 transition-transform duration-200 ${
//                       open ? "rotate-180" : ""
//                     }`}
//                   />
//                 </Listbox.Button>

//                 <Listbox.Options className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 text-sm">
//                   {["all", "pending", "reviewed", "approved", "rejected"].map(
//                     (st, i) => (
//                       <Listbox.Option key={i} value={st}>
//                         {({ active, selected }) => (
//                           <div
//                             className={`flex justify-between items-center px-3 py-2 cursor-pointer rounded-md ${
//                               active
//                                 ? "bg-sky-100 text-sky-700"
//                                 : "text-gray-700"
//                             }`}
//                           >
//                             <span>
//                               {st === "all"
//                                 ? "Semua Status"
//                                 : st === "pending"
//                                 ? "Menunggu Review"
//                                 : st === "reviewed"
//                                 ? "Sudah Direview"
//                                 : st === "approved"
//                                 ? "Disetujui"
//                                 : st === "rejected"
//                                 ? "Ditolak"
//                                 : st}
//                             </span>
//                             {selected && (
//                               <Check className="w-4 h-4 text-sky-600" />
//                             )}
//                           </div>
//                         )}
//                       </Listbox.Option>
//                     )
//                   )}
//                 </Listbox.Options>
//               </div>
//             )}
//           </Listbox>

//           {/* Department Filter */}
//           <Listbox value={departmentFilter} onChange={setDepartmentFilter}>
//             {({ open }) => (
//               <div className="relative w-48">
//                 <Listbox.Button className="w-full flex justify-between items-center px-3 py-2 border border-gray-200 rounded-lg bg-white shadow-sm text-left text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
//                   <span>
//                     {departmentFilter === "all"
//                       ? "Semua Departemen"
//                       : departmentFilter}
//                   </span>
//                   <ChevronDown
//                     className={`w-4 h-4 text-gray-500 ml-1 transition-transform duration-200 ${
//                       open ? "rotate-180" : ""
//                     }`}
//                   />
//                 </Listbox.Button>

//                 <Listbox.Options className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 text-sm">
//                   {["all", "Engineering", "Design", "Product", "Marketing"].map(
//                     (dept, i) => (
//                       <Listbox.Option key={i} value={dept}>
//                         {({ active, selected }) => (
//                           <div
//                             className={`flex justify-between items-center px-3 py-2 cursor-pointer rounded-md ${
//                               active
//                                 ? "bg-sky-100 text-sky-700"
//                                 : "text-gray-700"
//                             }`}
//                           >
//                             <span>
//                               {dept === "all" ? "Semua Departemen" : dept}
//                             </span>
//                             {selected && (
//                               <Check className="w-4 h-4 text-sky-600" />
//                             )}
//                           </div>
//                         )}
//                       </Listbox.Option>
//                     )
//                   )}
//                 </Listbox.Options>
//               </div>
//             )}
//           </Listbox>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto">
//         <table style={{ width: "100%", borderCollapse: "collapse" }}>
//           <thead>
//             <tr style={{ background: "#f9fafb", textAlign: "left" }}>
//               <th style={{ padding: "12px" }}>Pelamar</th>
//               <th>Posisi</th>
//               <th>Departemen</th>
//               <th>Lokasi</th>
//               <th>Status</th>
//               <th>Tanggal Lamar</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredApplications.length > 0 ? (
//               filteredApplications.map((app) => (
//                 <tr key={app.id} style={{ borderBottom: "1px solid #eee" }}>
//                   <td
//                     style={{
//                       padding: "12px",
//                       display: "flex",
//                       alignItems: "center",
//                       gap: "10px",
//                     }}
//                   >
//                     <img
//                       src={app.avatar}
//                       alt={app.applicantName}
//                       style={{
//                         width: "40px",
//                         height: "40px",
//                         borderRadius: "50%",
//                       }}
//                     />
//                     <div>
//                       <div style={{ fontWeight: "bold" }}>
//                         {app.applicantName}
//                       </div>
//                       <div style={{ fontSize: "12px", color: "#666" }}>
//                         {app.applicantEmail}
//                       </div>
//                     </div>
//                   </td>
//                   <td>{app.jobTitle}</td>
//                   <td>{app.department}</td>
//                   <td>{app.location}</td>
//                   <td>{renderStatus(app.status)}</td>
//                   <td>
//                     {new Date(app.appliedDate).toLocaleDateString("id-ID")}
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="6" style={{ textAlign: "center", padding: "15px" }}>
//                   Tidak ada data lamaran
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// export default Lamaranadmin;
