import React from "react";

const Card = React.forwardRef(({ className = "", ...props }, ref) => (
  <div
    className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}
    ref={ref}
    {...props}
  />
));

Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className = "", ...props }, ref) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} ref={ref} {...props} />
));

CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className = "", ...props }, ref) => (
  <h2
    className={`text-2xl font-semibold leading-none tracking-tight text-slate-900 ${className}`}
    ref={ref}
    {...props}
  />
));

CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className = "", ...props }, ref) => (
  <p className={`text-sm text-slate-500 ${className}`} ref={ref} {...props} />
));

CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className = "", ...props }, ref) => (
  <div className={`p-6 pt-0 ${className}`} ref={ref} {...props} />
));

CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className = "", ...props }, ref) => (
  <div className={`flex items-center p-6 pt-0 ${className}`} ref={ref} {...props} />
));

CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
