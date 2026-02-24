import React from "react";

const RadioGroup = ({ value, onValueChange, className = "", children, ...props }) => {
  return (
    <div
      role="radiogroup"
      className={`flex flex-col gap-2 ${className}`}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        const childValue = child.props.value;
        return React.cloneElement(child, {
          checked: value === childValue,
          onChange: () => onValueChange && onValueChange(childValue),
        });
      })}
    </div>
  );
};

const RadioGroupItem = React.forwardRef(
  ({ className = "", checked, onChange, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="radio"
        className={`h-4 w-4 rounded-full border border-slate-300 text-slate-900 focus:ring-slate-900 ${className}`}
        checked={checked}
        onChange={onChange}
        {...props}
      />
    );
  }
);

RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };

