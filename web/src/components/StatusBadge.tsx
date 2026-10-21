import type { TournamentStatus } from "../api/types";
import { STATUS_LABELS } from "../utils/format";

export function StatusBadge({ status }: { status: TournamentStatus }) {
    if (status === "IN_PROGRESS") {
        return (
            <span className="inline-flex items-center gap-2 text-live">
                <span className="relative size-2 rounded-full bg-live">
                    <span className="absolute inset-0 rounded-full bg-live motion-safe:animate-ping" />
                </span>
                {STATUS_LABELS[status]}
            </span>
        );
    }

    return <span className={status === "REGISTRATION" ? "text-accent" : "text-muted"}>{STATUS_LABELS[status]}</span>;
}
