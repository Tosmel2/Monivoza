import React from "react";

// Very minimal slider implementation matching the props our pages use.
// For more advanced behavior, replace with a full slider component later.

const Slider = React.forwardRef(({ className = "", min = 0, max = 100, step = 1, value, onValueChange, ...props }, ref) => {
  const handleChange = (event) => {
    const numeric = Number(event.target.value);
    if (onValueChange) {
      onValueChange([numeric]);
    }
  };

  const currentValue = Array.isArray(value) ? value[0] : value ?? min;

  return (
    <input
      ref={ref}
      type="range"
      min={min}
      max={max}
      step={step}
      value={currentValue}
      onChange={handleChange}
      className={`w-full h-2 rounded-lg bg-slate-200 accent-slate-900 ${className}`}
      {...props}
    />
  );
});

Slider.displayName = "Slider";

export { Slider };

