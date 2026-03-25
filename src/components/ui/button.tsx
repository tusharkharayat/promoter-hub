import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold ring-offset-background transition-all duration-300 samsung-glide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.96]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover rounded-pill",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-pill",
        outline: "border border-border bg-background hover:bg-muted rounded-pill",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-pill",
        ghost: "hover:bg-accent hover:text-accent-foreground rounded-pill",
        link: "text-primary underline-offset-4 hover:underline",
        samsung: "bg-primary text-primary-foreground hover:bg-primary-hover rounded-pill shadow-soft hover:shadow-elegant hover:-translate-y-0.5",
        "samsung-outline": "border border-border bg-background text-foreground hover:bg-muted rounded-pill hover:-translate-y-0.5",
      },
      size: {
        default: "h-12 px-6 py-3 text-sm",
        sm: "h-10 px-4 text-sm",
        lg: "h-14 px-10 text-base",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
