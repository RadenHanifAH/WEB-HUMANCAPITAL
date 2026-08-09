import React from "react";
import { Pencil } from "lucide-react";

const SkillsSection = ({ skills = [], onEdit }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold tracking-wide text-gray-900">
          SKILLS
        </h3>
        <button
          type="button"
          onClick={onEdit}
          aria-label="Edit skills"
          className="text-gray-400 hover:text-sky-600 transition-colors p-1 rounded-md hover:bg-gray-50"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </div>

      <hr className="border-gray-100 my-4" />

      {skills.length === 0 ? (
        <p className="text-sm text-gray-400">Belum ada skill ditambahkan</p>
      ) : (
        <div className="flex flex-wrap gap-2.5">
          {skills.map((skill) => (
            <span
              key={skill.id ?? skill.nama}
              className="px-4 py-1.5 rounded-full bg-sky-100 text-sky-800 text-sm font-medium"
            >
              {skill.nama}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillsSection;
