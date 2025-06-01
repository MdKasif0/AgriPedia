import * as React from "react";
import { useId } from "react"; // useId is a top-level export from React
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Label } from "./label";

interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  containerClassName?: string;
}

const FloatingLabelInput = React.forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({ label, id, className, containerClassName, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className={cn("relative", containerClassName)}>
        <Input
          ref={ref}
          id={inputId}
          className={cn("peer", className)} // Add 'peer' class
          placeholder=" " // Important: placeholder must not be empty for :placeholder-shown to work correctly
          {...props}
        />
        <Label
          htmlFor={inputId}
          className={cn(
            "absolute text-muted-foreground duration-300 transform -translate-y-1/2 scale-100 top-1/2 left-3 z-10 origin-[0]",
            "peer-focus:scale-75 peer-focus:-translate-y-3.5 peer-focus:top-2 peer-focus:text-primary",
            "peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:-translate-y-3.5 peer-[:not(:placeholder-shown)]:top-2",
            // If you want the label to also be primary color when not placeholder-shown (i.e. has value)
            // "peer-[:not(:placeholder-shown)]:text-primary"
          )}
        >
          {label}
        </Label>
      </div>
    );
  }
);
FloatingLabelInput.displayName = "FloatingLabelInput";

export { FloatingLabelInput };
