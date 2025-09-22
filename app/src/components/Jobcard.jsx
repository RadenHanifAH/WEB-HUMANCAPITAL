import React, { useState } from "react";
import { Building2, MapPin, Briefcase, Calendar } from "lucide-react";

function JobCard({
  title,
  category,
  company,
  location,
  experience,
  department,
  validUntil,
  isNew = false,
  description,
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-white shadow-md hover:shadow-lg transition-shadow cursor-pointer w-full max-w-md mx-auto">
      <div className="space-y-4">
        {/* Category + Status Baru */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="px-2 py-1 text-[10px] sm:text-xs font-medium rounded-full bg-orange-100 text-orange-800">
            {category}
          </span>
          {isNew && (
            <span className="px-2 py-1 text-[10px] sm:text-xs font-medium rounded-full bg-green-100 text-green-800">
              Baru
            </span>
          )}
        </div>

        {/* Job Title */}
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 hover:text-sky-700 transition-colors leading-snug">
          {title}
        </h3>

        {/* Job Details */}
        <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-600">
          <div className="flex items-center gap-2 flex-wrap">
            <Building2 className="h-4 w-4 shrink-0" />
            <span className="truncate">{company}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{location}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Briefcase className="h-4 w-4 shrink-0" />
            <span>{experience}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{department}</span>
          </div>
        </div>

        {/* Deskripsi (expandable) */}
        {description && (
          <div className="text-xs sm:text-sm text-gray-600">
            <p className={`${expanded ? "" : "line-clamp-2"}`}>
              {description}
            </p>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-blue-600 text-xs mt-1 hover:underline"
            >
              {expanded ? "Sembunyikan" : "Selengkapnya"}
            </button>
          </div>
        )}

        {/* Valid Until */}
        <div className="pt-2 border-t border-gray-200">
          <p className="text-[10px] sm:text-xs text-gray-500">
            Berlaku hingga {validUntil}
          </p>
        </div>
      </div>
    </div>
  );
}

export default JobCard;
