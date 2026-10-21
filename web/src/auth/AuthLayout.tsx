import type { ReactNode } from "react";

interface AuthLayoutProps {
    title: string;
    accent: string;
    children: ReactNode;
}

export function AuthLayout({ title, accent, children }: AuthLayoutProps) {
    return (
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2 md:items-start">
            <title>{`${title} ${accent} · Bracketly`}</title>
            <h1 className="font-display text-6xl leading-none uppercase sm:text-8xl">
                {title}
                <span className="block text-accent">{accent}</span>
            </h1>
            <div className="border border-line bg-surface p-6 sm:p-8">{children}</div>
        </div>
    );
}