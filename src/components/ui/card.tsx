import * as React from "react";
import { cn } from "@/lib/utils";

/** Premium dark surface card with hairline border + subtle top-light gradient. */
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("surface-card", className)} {...props} />
  )
);
Card.displayName = "Card";

export { Card };
