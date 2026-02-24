import React from "react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const TabsContext = React.createContext(null);

const Tabs = ({ defaultValue, value: controlled, onValueChange, className = "", children, ...props }) => {
  const [internal, setInternal] = React.useState(defaultValue);
  const value = controlled ?? internal;

  const setValue = (v) => {
    setInternal(v);
    onValueChange && onValueChange(v);
  };

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const TabsList = ({ className = "", ...props }) => (
  <div
    className={cn(
      "inline-flex items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-500",
      className
    )}
    {...props}
  />
);

const TabsTrigger = ({ value, className = "", children, ...props }) => {
  const ctx = React.useContext(TabsContext);
  const isActive = ctx?.value === value;

  return (
    <button
      type="button"
      onClick={() => ctx?.setValue(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all",
        isActive
          ? "bg-white text-slate-900 shadow-sm"
          : "text-slate-500 hover:text-slate-900",
        className
      )}
      data-state={isActive ? "active" : "inactive"}
      {...props}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, className = "", children, ...props }) => {
  const ctx = React.useContext(TabsContext);
  if (ctx?.value !== value) return null;

  return (
    <div className={cn("mt-2", className)} {...props}>
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };

