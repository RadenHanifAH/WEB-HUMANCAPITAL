import React from "react";
import { MapPin, Users, Calendar, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { Listbox } from "@headlessui/react";

export default function JobTable({ filteredJobs, handleActionSelect, getStatusBadge }) {
  // Config untuk menjaga konsistensi tinggi tabel
  const itemsPerPage = 5;
  const emptyRows = itemsPerPage - filteredJobs.length;

  return (
    <div className="w-full">
      <table className="w-full text-left text-md table-fixed border-collapse">
        <thead className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 font-bold w-[25%]">Posisi</th>
            <th className="px-4 py-3 font-bold w-[20%]">Departemen</th>
            <th className="px-4 py-3 font-bold w-[15%]">Lokasi</th>
            <th className="px-4 py-3 font-bold w-[10%]">Status</th>
            <th className="px-4 py-3 font-bold w-[10%]">Pelamar</th>
            <th className="px-4 py-3 font-bold w-[15%]">Deadline</th>
            <th className="px-4 py-3 font-bold w-[5%] text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {filteredJobs.length > 0 ? (
            // Tambahkan index parameter di sini
            filteredJobs.map((job, index) => {
              
              // LOGIKA: Jika baris berada di index 3 atau 4 (Baris ke-4 atau ke-5),
              // maka dropdown akan terbuka ke ATAS. Sisanya ke BAWAH.
              const isBottomRow = index >= 4; 

              return (
                <tr key={job.id} className="hover:bg-sky-50 transition-colors duration-150 h-[75px]">
                  {/* Kolom Posisi */}
                  <td className="px-4 py-3 align-middle truncate pr-2">
                    <div className="font-medium text-gray-900 truncate" title={job.title}>
                      {job.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{job.type}</div>
                  </td>
                  
                  {/* Kolom Departemen */}
                  <td className="px-4 py-3 align-middle text-gray-600 truncate" title={job.department}>
                    {job.department}
                  </td>
                  
                  {/* Kolom Lokasi */}
                  <td className="px-4 py-3 align-middle truncate">
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" /> 
                      <span className="truncate">{job.location}</span>
                    </div>
                  </td>
                  
                  {/* Kolom Status */}
                  <td className="px-4 py-3 align-middle">
                    {getStatusBadge(job.status)}
                  </td>
                  
                  {/* Kolom Pelamar */}
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" /> 
                      <span>{job.applicants || 0}</span>
                    </div>
                  </td>
                  
                  {/* Kolom Deadline */}
                  <td className="px-4 py-3 align-middle">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1 text-gray-400 text-xs mb-0.5">
                        <Calendar className="w-3 h-3 shrink-0" />
                        <span>Batas</span>
                      </div>
                      <span className="text-sm text-gray-700 font-medium truncate">
                        {job.deadline ? new Date(job.deadline).toLocaleDateString("id-ID") : "-"}
                      </span>
                    </div>
                  </td>
                  
                  {/* Kolom Aksi */}
                  <td className="px-4 py-3 text-right align-middle">
                    <Listbox value={null} onChange={(action) => handleActionSelect(job, action)}>
                      <div className="relative inline-block text-left">
                        <Listbox.Button className="p-2 hover:bg-white rounded-full hover:shadow-sm border border-transparent hover:border-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/50">
                          <MoreHorizontal className="w-5 h-5 text-gray-500" />
                        </Listbox.Button>
                        
                        <Listbox.Options 
                          className={`absolute right-0 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 p-1 focus:outline-none transform 
                          ${isBottomRow ? "bottom-full mb-1 origin-bottom-right" : "top-full mt-1 origin-top-right"}`}
                        >
                          <Listbox.Option value="view">
                            {({ active }) => (
                              <div className={`flex items-center w-full px-3 py-2.5 text-sm rounded-lg cursor-pointer transition-colors ${active ? "bg-sky-50 text-sky-700 font-medium" : "text-gray-700"}`}>
                                <Eye className="w-4 h-4 mr-3" /> Lihat Detail
                              </div>
                            )}
                          </Listbox.Option>
                          <Listbox.Option value="edit">
                            {({ active }) => (
                              <div className={`flex items-center w-full px-3 py-2.5 text-sm rounded-lg cursor-pointer transition-colors ${active ? "bg-amber-50 text-amber-700 font-medium" : "text-gray-700"}`}>
                                <Edit className="w-4 h-4 mr-3" /> Edit Data
                              </div>
                            )}
                          </Listbox.Option>
                          <div className="h-px bg-gray-100 my-1 mx-2" />
                          <Listbox.Option value="delete">
                            {({ active }) => (
                              <div className={`flex items-center w-full px-3 py-2.5 text-sm rounded-lg cursor-pointer transition-colors ${active ? "bg-red-50 text-red-700 font-medium" : "text-red-600"}`}>
                                <Trash2 className="w-4 h-4 mr-3" /> Hapus
                              </div>
                            )}
                          </Listbox.Option>
                        </Listbox.Options>
                      </div>
                    </Listbox>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-gray-500 bg-gray-50/50 italic">
                Data tidak ditemukan.
              </td>
            </tr>
          )}

          {filteredJobs.length > 0 && emptyRows > 0 && Array.from({ length: emptyRows }).map((_, index) => (
            <tr key={`empty-${index}`} className="h-[75px]">
              <td colSpan={7}>&nbsp;</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}