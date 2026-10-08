import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * Status chips, not marketing pills.
 *
 * Deliberately squared-off with a hairline border and a leading status dot —
 * this reads as an operations console annotation rather than the rounded,
 * pastel "✨ badge" pattern that makes generated UIs feel templated.
 */
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-[3px] border px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.08em] uppercase whitespace-nowrap [&_svg]:pointer-events-none [&_svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-primary/25 bg-primary/8 text-primary",
        secondary: "border-border bg-muted text-muted-foreground",
        outline: "border-border-strong bg-transparent text-foreground",
        destructive:
          "border-destructive/30 bg-destructive/8 text-destructive",
        success: "border-success/30 bg-success/8 text-success",
        warning: "border-warning/30 bg-warning/8 text-warning",
        neutral: "border-border bg-surface-alt text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

/** A 5px square, not a circle — crisp at small sizes and on-brand. */
function BadgeDot({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("size-[5px] shrink-0 rounded-full bg-current", className)}
    />
  );
}

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, BadgeDot, badgeVariants };
