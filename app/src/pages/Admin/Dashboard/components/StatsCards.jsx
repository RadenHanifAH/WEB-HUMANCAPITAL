import React from "react";

const StatsCards = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
    {stats.map((item, i) => {
      const Icon = item.icon;
      return (
        <div key={i} className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-gray-500">{item.title}</h2>
            <Icon className={`w-5 h-5 ${item.color}`} />
          </div>
          <div className="text-2xl font-bold">{item.value}</div>
          <p className="text-xs text-gray-500 mt-1">{item.change}</p>
        </div>
      );
    })}
  </div>
);

export default StatsCards;