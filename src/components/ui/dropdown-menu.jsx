import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

// top‑level container manages open state internally
const DropdownMenu = ({ children }) => {
  const [open, setOpen] = useState(false);
  const handleOpenChange = (value) => {
    // debug helper: leave in for now to trace behavior
    console.debug('[DropdownMenu] open ->', value);
    setOpen(value);
  };

  return (
    <div className="relative inline-block text-left">
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, { open, onOpenChange: handleOpenChange })
          : child
      )}
    </div>
  );
};

const DropdownMenuTrigger = ({ children, open, onOpenChange, asChild }) => {
  const handleClick = () => onOpenChange?.(!open);

  if (asChild && React.isValidElement(children)) {
    // merge click handler into child element
    return React.cloneElement(children, {
      onClick: (e) => {
        children.props.onClick?.(e);
        handleClick();
      },
      'aria-haspopup': 'menu',
      'aria-expanded': !!open,
    });
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-slate-100"
      aria-haspopup="menu"
      aria-expanded={open}
    >
      {children}
    </button>
  );
};

const DropdownMenuContent = ({ children, open, onOpenChange, className = "" }) => {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0"
        onClick={() => onOpenChange?.(false)}
      />
      <div className={`absolute right-0 mt-2 rounded-md border border-slate-200 bg-white shadow-lg z-50 ${className}`}>
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child, { onOpenChange })
            : child
        )}
      </div>
    </>
  );
};

const DropdownMenuItem = ({ children, onOpenChange, asChild }) => {
  const handleClick = () => {
    children?.props?.onClick?.();
    onOpenChange?.(false);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e) => {
        children.props.onClick?.(e);
        handleClick();
      },
      className: `${children.props.className || ""} w-full flex items-center`,
    });
  }

  return (
    <button
      onClick={handleClick}
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
