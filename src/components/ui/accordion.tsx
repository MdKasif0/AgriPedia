"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn, triggerHapticFeedback } from "@/lib/utils" // Added triggerHapticFeedback

// Redefine Accordion to intercept onValueChange
const Accordion = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>
>(({ onValueChange, ...props }, ref) => {
  // handleValueChange is called by AccordionPrimitive.Root, which will pass
  // string for type="single" and string[] for type="multiple".
  const handleValueChange = (value: string | string[]) => {
    triggerHapticFeedback();
    if (onValueChange) {
      // The onValueChange prop passed to this wrapped Accordion component
      // will have a signature like ((value: string) => void) | ((value: string[]) => void).
      // We use a type assertion here to inform TypeScript that we are handling
      // the polymorphic nature of the callback correctly. The actual type safety
      // relies on the user passing an onValueChange handler that matches the
      // accordion type (single/multiple) they are using.
      (onValueChange as (value: string | string[]) => void)(value);
    }
  };

  return (
    <AccordionPrimitive.Root
      ref={ref}
      onValueChange={handleValueChange} // handleValueChange now correctly typed for what AccordionPrimitive.Root provides
      {...props} // props includes the 'type' which dictates the actual signature for onValueChange
    />
  );
});
Accordion.displayName = AccordionPrimitive.Root.displayName;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))

AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
