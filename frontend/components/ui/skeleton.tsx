import { cn } from "@/lib/utils";

/**
 * Flat pulse rather than the usual gradient shimmer — a moving highlight is
 * exactly the kind of decorative gradient this design system forbids.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-[3px] bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
