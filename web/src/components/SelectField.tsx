import type { SelectHTMLAttributes } from "react";
import { FieldFrame } from "./FieldFrame";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    error?: string;
    hint?: string;
}

export function SelectField({ label, error, hint, children, ...selectProps }: SelectFieldProps) {
    return (
        <FieldFrame label={label} error={error} hint={hint}>
            {({ className, ...control }) => (
                <select {...control} className={`min-h-12 ${className}`} {...selectProps}>
                    {children}
                </select>
            )}
        </FieldFrame>
    );
}
