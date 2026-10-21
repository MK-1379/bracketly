import type { TextareaHTMLAttributes } from "react";
import { FieldFrame } from "./FieldFrame";

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string;
    hint?: string;
}

export function TextAreaField({ label, error, hint, ...textareaProps }: TextAreaFieldProps) {
    return (
        <FieldFrame label={label} error={error} hint={hint}>
            {({ className, ...control }) => (
                <textarea {...control} rows={4} className={`py-3 ${className}`} {...textareaProps} />
            )}
        </FieldFrame>
    );
}