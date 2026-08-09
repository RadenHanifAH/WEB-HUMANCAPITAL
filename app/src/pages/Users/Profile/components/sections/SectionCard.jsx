import React from "react";
import { PlusCircle, Edit2 } from "lucide-react";

const SectionCard = ({
  title,
  items = [],
  renderItem,
  onAdd,
  onEdit,
  emptyText = "Belum ada data.",
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center justify-between px-8 py-6">
      <h3 className="text-base font-semibold tracking-wide text-slate-900">
        {title}
      </h3>

      <button
        onClick={onAdd}
        className="flex text-base items-center gap-2 font-semibold text-sky-600 hover:text-sky-700"
      >
        <PlusCircle size={15} />
        TAMBAHKAN
      </button>
    </div>

    <div className="mx-8 border-b border-slate-200" />

    <div className="p-8">
      {items.length === 0 ? (
        <div className="py-8 text-center text-gray-400">{emptyText}</div>
      ) : (
        items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <div key={item.id} className="flex items-stretch gap-4">
              {/* TIMELINE: dot + connecting line */}
              <div className="flex flex-col items-center">
                <span className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky-100">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      isLast ? "bg-slate-400" : "bg-sky-600"
                    }`}
                  />
                </span>

                {!isLast && (
                  <div className="my-1 w-px flex-1 bg-slate-200" />
                )}
              </div>

              {/* CONTENT */}
              <div
                className={`flex flex-1 items-start justify-between gap-4 ${
                  !isLast ? "mb-6 pb-6" : ""
                }`}
              >
                <div className="flex-1">{renderItem(item)}</div>

                <div className="flex shrink-0 items-center gap-3">
                  <button
                    onClick={() => onEdit?.(item)}
                    title="Edit"
                    className="rounded-md p-1.5 text-gray-400 hover:bg-sky-50 hover:text-sky-600"
                  >
                    <Edit2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  </div>
);

export default SectionCard;