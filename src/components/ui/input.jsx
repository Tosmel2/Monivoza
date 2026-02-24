import React from "react";

const Input = React.forwardRef(({ className = "", type = "text", ...props }, ref) => (
  <input
    type={type}
    className={`flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${className}`}
    ref={ref}
    {...props}
  />
));

Input.displayName = "Input";

export { Input };
