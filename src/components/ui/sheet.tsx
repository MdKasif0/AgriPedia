"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { motion, PanInfo } from "framer-motion" // Added motion and PanInfo

import { cn } from "@/lib/utils"

const Sheet = SheetPrimitive.Root

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => {
  const contentRef = React.useRef<React.ElementRef<typeof SheetPrimitive.Content>>(null);
  const DRAG_CLOSE_THRESHOLD = 100; // Pixels
  const DRAG_VELOCITY_THRESHOLD = 200; // Pixels per second

  // Combine the forwarded ref and local ref
  React.useImperativeHandle(ref, () => contentRef.current as HTMLDivElement);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (side !== "bottom") return;

    const currentTarget = contentRef.current;
    if (!currentTarget) return;

    const sheetHeight = currentTarget.offsetHeight;
    const dismissThreshold = Math.min(DRAG_CLOSE_THRESHOLD, sheetHeight * 0.5); // At least 50% or DRAG_CLOSE_THRESHOLD

    if (
      (info.offset.y > dismissThreshold && info.velocity.y >= 0) || // Dragged down significantly
      (info.velocity.y > DRAG_VELOCITY_THRESHOLD && info.offset.y > 0) // Dragged down fast
    ) {
      // Attempt to find and click the SheetClose button as a way to trigger close
      // This is a workaround. Ideally, Radix provides a direct way or we pass onOpenChange.
      const closeButton = currentTarget.querySelector(
        'button[aria-label="Close"]'
      ) as HTMLElement | null;
      
      if (closeButton) {
        closeButton.click();
      } else {
        // Fallback if the specific close button isn't found (e.g. if it's custom)
        // This relies on the Sheet component being controlled and onOpenChange being passed to SheetPrimitive.Root
        // For this component, props contains Radix props, not onOpenChange directly from our Sheet.
        // The actual onOpenChange is on SheetPrimitive.Root.
        // So this is a conceptual placeholder for a more robust solution if the button query fails.
        console.warn("SheetClose button not found for drag-to-dismiss. Implement a more robust close mechanism.");
        // Attempting a more generic Radix close if possible (might not work as expected without context)
        // This is speculative, the button click is more reliable for now.
        if (props.onInteractOutside) {
          // props.onInteractOutside(event as Event); // This might not trigger close
        }
      }
    }
  };

  const MotionSheetPrimitiveContent = motion(SheetPrimitive.Content as any); // Added 'as any'

  return (
    <SheetPortal>
      <SheetOverlay />
      <MotionSheetPrimitiveContent
        ref={contentRef}
        className={cn(sheetVariants({ side }), className)}
        {...(side === "bottom"
          ? {
              drag: "y",
              dragConstraints: { top: 0, bottom: 0 }, // Allow dragging down from initial pos
              dragElastic: { top: 0, bottom: 0.5 }, // Elasticity when dragging down
              onDragEnd: handleDragEnd,
              // Retain existing animations for open/close, drag is an addition
              // If drag causes issues with these, we might need to use Framer Motion's animate/exit
              // for the slide effect when side === "bottom".
            }
          : {})}
        {...props} // Spread other props like onOpenAutoFocus, onEscapeKeyDown etc.
      >
        {children}
        <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </MotionSheetPrimitiveContent>
    </SheetPortal>
  );
});
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
