import React, { useState, useRef } from "react";
import { ChevronDown } from "lucide-react";

const Select = ({ children, onValueChange }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);

  return (
    <div className="relative">
      <div
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        className="w-full flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 cursor-pointer"
      >
        {React.cloneElement(children, { open, onValueChange: (v) => { onValueChange?.(v); setOpen(false); } })}
      </div>
    </div>
  );
};

const SelectTrigger = ({ children, open }) => {
  return (
    <>
      <span className="flex-1 text-left">{children}</span>
      <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
    </>
  );
};

const SelectValue = ({ placeholder }) => {
  return <span className="text-slate-600">{placeholder}</span>;
};

const SelectContent = ({ children, open }) => {
  if (!open) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-md border border-slate-200 bg-white shadow-md">
      {children}
    </div>
  );
};

const SelectItem = ({ value, children, onValueChange }) => {
  return (
    <div
      onClick={() => onValueChange?.(value)}
      className="px-3 py-2 cursor-pointer hover:bg-slate-100 text-sm"
    >
      {children}
    </div>
  );
};

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
