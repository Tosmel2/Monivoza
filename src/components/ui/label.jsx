import React from "react";

const Label = React.forwardRef(({ className = "", ...props }, ref) => (
  <label
    className={`text-sm font-medium leading-none text-slate-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
    ref={ref}
    {...props}
  />
));

Label.displayName = "Label";

export { Label };
