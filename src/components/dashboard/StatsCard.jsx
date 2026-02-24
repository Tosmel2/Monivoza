import React from "react";

export default function StatsCard({ title, value, subtitle, icon, trend, trendUp, gradient }) {
  const gradients = {
    teal: "from-teal-500 to-teal-600",
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    pink: "from-pink-500 to-pink-600",
    indigo: "from-indigo-500 to-indigo-600",
  };

  return (
    <div
      className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/50 p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-sm text-slate-500">{subtitle}</p>
          )}
          {trend && (
            <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
              trendUp ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
            }`}>
              {trendUp ? "↑" : "↓"} {trend}
            </div>
          )}
        </div>
        <div className={`p-4 rounded-2xl bg-linear-to-br ${gradients[gradient] || gradients.teal} shadow-lg`}>
          {icon && React.createElement(icon, { className: "w-6 h-6 text-white" })}
        </div>
      </div>
      <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-linear-to-br ${gradients[gradient] || gradients.teal} opacity-5`} />
    </div>
  );
}