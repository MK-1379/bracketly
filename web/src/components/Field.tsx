import type { InputHTMLAttributes } from "react";
import { FieldFrame } from "./FieldFrame";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    hint?: string;
}

export function Field({ label, error, hint, ...inputProps }: FieldProps) {
    return (
        <FieldFrame label={label} error={error} hint={hint}>
            {({ className, ...control }) => <input {...control} className={`min-h-12 ${className}`} {...inputProps} />}
        </FieldFrame>
    );
}