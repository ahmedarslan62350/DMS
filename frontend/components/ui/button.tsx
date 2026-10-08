import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * Buttons are flat blocks of ink — never gradients, never glows.
 * The accent (deep navy) is reserved for `default` (primary) actions.
 * Sizes: lg = 48px primary CTA, default = 40px, sm = 32px dense contexts.
 */
const buttonVariants = cva(
  [
    "group/button relative inline-flex shrink-0 items-center justify-center gap-2",
    "rounded-md border border-transparent bg-clip-padding",
    "font-medium whitespace-nowrap select-none",
    "transition-[background-color,border-color,color,box-shadow] duration-150",
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:pointer-events-none disabled:opacity-45",
    "aria-invalid:border-destructive",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-hover",
        outline:
          "border-border bg-surface text-foreground hover:bg-muted hover:border-border-strong",
        secondary: "bg-muted text-foreground hover:bg-border",
        ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
        destructive:
          "border-destructive/25 bg-destructive/8 text-destructive hover:bg-destructive/14",
        solidDestructive:
          "bg-destructive text-destructive-foreground hover:opacity-90",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-7 gap-1 px-2 text-[12px]",
        sm: "h-8 gap-1.5 px-3 text-[13px]",
        default: "h-10 gap-2 px-3.5 text-sm",
        lg: "h-12 gap-2 px-5 text-[15px]",
        icon: "h-10 w-10",
        "icon-xs": "h-7 w-7",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
