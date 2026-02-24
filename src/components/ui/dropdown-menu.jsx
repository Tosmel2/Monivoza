import React from "react";
import { ChevronDown } from "lucide-react";

const DropdownMenu = ({ children, open, onOpenChange }) => {
  return (
    <div className="relative inline-block text-left">
      {React.cloneElement(children, { open, onOpenChange })}
    </div>
  );
};

const DropdownMenuTrigger = ({ children, open, onOpenChange }) => {
  return (
    <button
      onClick={() => onOpenChange?.(!open)}
      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-slate-100"
    >
      {children}
    </button>
  );
};

const DropdownMenuContent = ({ children, open, onOpenChange }) => {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0"
        onClick={() => onOpenChange?.(false)}
      />
      <div className="absolute right-0 mt-2 w-56 rounded-md border border-slate-200 bg-white shadow-lg z-50">
        {React.cloneElement(children, { onOpenChange })}
      </div>
    </>
  );
};

const DropdownMenuItem = ({ children, onOpenChange }) => {
  return (
    <button
      onClick={() => {
        children?.props?.onClick?.();
        onOpenChange?.();
      }}
      className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 text-slate-900 flex items-center"
    >
      {children}
    </button>
  );
};

const DropdownMenuSeparator = () => {
  return <div className="my-1 h-px bg-slate-200" />;
};

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
};
