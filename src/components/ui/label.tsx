import * as React from "react";
import { cn } from "@/lib/utils";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-xs font-semibold tracking-tight text-foreground/80 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 uppercase",
        className
      )}
      {...props}
    />
  )
);
Label.displayName = "Label";

export { Label };
