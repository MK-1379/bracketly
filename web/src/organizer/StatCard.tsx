export function StatCard({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div className="flex flex-col gap-2 border border-line bg-surface p-5">
            <dt className="text-xs font-bold uppercase tracking-widest text-muted">{label}</dt>
            <dd className={`font-display text-4xl leading-none uppercase ${highlight ? "text-accent" : ""}`}>
                {value}
            </dd>
        </div>
    );
}