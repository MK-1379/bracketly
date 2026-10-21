import type { ReactNode } from "react";

interface PanelSectionProps {
    title: string;
    action?: ReactNode;
    children: ReactNode;
}

export function PanelSection({ title, action, children }: PanelSectionProps) {
    return (
        <section className="flex flex-col gap-4 border-t-2 border-fg pt-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-3xl leading-none uppercase">{title}</h2>
                {action}
            </div>
            {children}
        </section>
    );
}
