import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Inputs are hairline boxes with a flat focus treatment — no shadow, no glow.
 * 40px tall keeps them comfortable without bloating dense forms.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-md border border-input bg-surface px-3 py-2",
        "text-sm text-foreground transition-colors duration-150 outline-none",
        "placeholder:text-muted-foreground/70",
        "hover:border-border-strong",
        "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25",
        "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60",
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
        "file:mr-3 file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "[&::-webkit-calendar-picker-indicator]:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
