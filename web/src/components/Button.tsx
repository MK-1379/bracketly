import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "outline";
}

const VARIANTS = {
    primary: "border-accent bg-accent text-bg hover:shadow-[4px_4px_0_var(--color-fg)]",
    outline: "border-fg text-fg hover:shadow-[4px_4px_0_var(--color-accent)]",
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
    return (
        <button
            type="button"
            className={`inline-flex min-h-11 items-center justify-center border-2 px-5 text-sm font-extrabold uppercase tracking-wider transition hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-0 active:shadow-none disabled:pointer-events-none disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
            {...props}
        />
    );
}