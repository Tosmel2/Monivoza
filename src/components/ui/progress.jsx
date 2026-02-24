import React from "react";

const Progress = ({ className = "", value = 0, ...props }) => {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      className={`relative h-2 w-full overflow-hidden rounded-full bg-slate-200 ${className}`}
      {...props}
    >
      <div
        className="h-full bg-slate-900 transition-all"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
};

export { Progress };

