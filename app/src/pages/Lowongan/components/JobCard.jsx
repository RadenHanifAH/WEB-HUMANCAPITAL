import React from "react";
import { MapPin } from "lucide-react";

function JobCard({ job, isSelected, onClick }) {
  return (
    <div
      onClick={() => onClick(job)}
      className={`rounded-2xl p-6 bg-white border cursor-pointer transition-all duration-300 ${
        isSelected
          ? "border-sky-600 shadow-xl ring-1 ring-sky-600 bg-sky-50"
          : "border-gray-200 shadow-md hover:shadow-lg hover:border-sky-300"
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <span className="bg-orange-200 text-amber-800 text-[10px] sm:text-xs px-3 py-1 rounded-full font-medium uppercase tracking-wider">
          {job.department}
        </span>
        <span className="border border-gray-300 text-gray-600 text-[10px] sm:text-xs px-3 py-1 rounded-full font-medium">
          {job.type}
        </span>
      </div>
      <h2 className="text-lg font-extrabold text-gray-900 mb-2">{job.title}</h2>
      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{job.description}</p>
      <div className="space-y-1 text-sm text-gray-600 mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-600" /> {job.location}
        </div>
      </div>
    </div>
  );
}

export default JobCard;