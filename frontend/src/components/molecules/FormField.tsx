import { Input, InputProps } from "../atoms/Input"
import { Label } from "../atoms/Label"
import React from "react"

interface FormFieldProps extends InputProps {
  label: string
  error?: string
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <div className="space-y-2 w-full">
        <Label>{label}</Label>
        <Input ref={ref} {...props} />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    )
  }
)
FormField.displayName = "FormField"
