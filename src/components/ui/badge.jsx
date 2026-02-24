import React from "react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Badge = ({ className = "", variant = "default", ...props }) => {
  const base =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors";

  const variants = {
    default: "border-transparent bg-slate-900 text-white",
    secondary: "border-transparent bg-slate-100 text-slate-900",
    outline: "text-slate-900 border-slate-200",
  };

  return (
    <span
      className={cn(base, variants[variant] || variants.default, className)}
      {...props}
    />
  );
};

export { Badge };

