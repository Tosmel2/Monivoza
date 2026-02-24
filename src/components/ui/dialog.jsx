import React from "react";
import { X } from "lucide-react";

const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-lg shadow-lg max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {React.cloneElement(children, { onOpenChange })}
      </div>
    </div>
  );
};

const DialogContent = ({ children, onOpenChange }) => {
  return (
    <div className="relative">
      <button
        onClick={() => onOpenChange?.(false)}
        className="absolute right-4 top-4 text-slate-500 hover:text-slate-900"
      >
        <X className="h-4 w-4" />
      </button>
      {children}
    </div>
  );
};

const DialogHeader = ({ className = "", ...props }) => (
  <div className={`border-b border-slate-200 p-6 ${className}`} {...props} />
);

const DialogTitle = ({ className = "", ...props }) => (
  <h2 className={`text-lg font-semibold text-slate-900 ${className}`} {...props} />
);

const DialogDescription = ({ className = "", ...props }) => (
  <p className={`text-sm text-slate-500 ${className}`} {...props} />
);

const DialogFooter = ({ className = "", ...props }) => (
  <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`} {...props} />
);

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter };
