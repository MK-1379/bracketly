import { type InputHTMLAttributes, useId } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    hint?: string;
}

export function Field({ label, error, hint, ...inputProps }: FieldProps) {
    const id = useId();
    const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="text-xs font-bold uppercase tracking-widest text-muted">
                {label}
            </label>
            <input
                id={id}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy}
                className={`min-h-12 border-2 bg-surface px-4 text-fg placeholder:text-muted/60 focus:border-accent focus:outline-none ${
                    error ? "border-live" : "border-line-strong"
                }`}
                {...inputProps}
            />
            {error ? (
                <p id={`${id}-error`} className="text-sm font-semibold text-live">
                    {error}
                </p>
            ) : (
                hint && (
                    <p id={`${id}-hint`} className="text-sm text-muted">
                        {hint}
                    </p>
                )
            )}
        </div>
    );
}