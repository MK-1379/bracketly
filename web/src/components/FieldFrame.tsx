import { type ReactNode, useId } from "react";

export interface ControlProps {
    id: string;
    "aria-invalid": true | undefined;
    "aria-describedby": string | undefined;
    className: string;
}

interface FieldFrameProps {
    label: string;
    error?: string;
    hint?: string;
    children: (control: ControlProps) => ReactNode;
}

export function FieldFrame({ label, error, hint, children }: FieldFrameProps) {
    const id = useId();
    const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="text-xs font-bold uppercase tracking-widest text-muted">
                {label}
            </label>
            {children({
                id,
                "aria-invalid": error ? true : undefined,
                "aria-describedby": describedBy,
                className: `border-2 bg-surface px-4 text-fg placeholder:text-muted/60 focus:border-accent focus:outline-none ${
                    error ? "border-live" : "border-line-strong"
                }`,
            })}
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
