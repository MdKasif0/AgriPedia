import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-accent-emerald text-white hover:bg-accent-emerald/90 hover:shadow-[0_0_15px_5px_rgba(0,195,122,0.2)]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-[0_0_15px_5px_rgba(255,102,102,0.3)]",
        outline:
          "border border-border bg-transparent hover:bg-accent-emerald/10 hover:text-accent-emerald hover:border-accent-emerald",
        secondary:
          "bg-button-primary text-foreground border border-border hover:bg-neutral-800/60 hover:border-accent-emerald",
        ghost: "hover:bg-accent-emerald/10 hover:text-accent-emerald text-foreground",
        link: "text-accent-emerald underline-offset-4 hover:underline hover:text-accent-emerald/80",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3", // changed from rounded-md
        lg: "h-11 rounded-lg px-8", // changed from rounded-md
        icon: "h-10 w-10", // already rounded-lg by default from base
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
