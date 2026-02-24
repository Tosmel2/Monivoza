import React from "react";

const Avatar = React.forwardRef(({ className = "", ...props }, ref) => (
  <div
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-full bg-slate-100 text-slate-900 text-sm font-medium h-10 w-10 ${className}`}
    ref={ref}
    {...props}
  />
));

Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef(({ className = "", ...props }, ref) => (
  <img
    className={`h-full w-full rounded-full object-cover ${className}`}
    ref={ref}
    {...props}
  />
));

AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef(({ className = "", ...props }, ref) => (
  <div
    className={`flex items-center justify-center h-full w-full bg-slate-200 text-slate-900 font-semibold ${className}`}
    ref={ref}
    {...props}
  />
));

AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
