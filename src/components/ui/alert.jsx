import React from "react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Alert = ({ className = "", variant = "default", ...props }) => {
  const base =
    "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-1px] [&>svg]:mr-3 flex items-start";
  const variants = {
    default: "bg-slate-50 text-slate-900 border-slate-200",
    destructive: "bg-red-50 text-red-900 border-red-200",
  };

  return (
    <div className={cn(base, variants[variant] || variants.default, className)} {...props} />
  );
};

const AlertDescription = ({ className = "", ...props }) => (
  <div className={cn("text-sm text-current", className)} {...props} />
);

export { Alert, AlertDescription };

