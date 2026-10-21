import { Link } from "react-router";
import type { TournamentSummary } from "../api/types";
import { formatDate } from "../utils/format";
import { StatusBadge } from "./StatusBadge";

interface TournamentCardProps {
    tournament: TournamentSummary;
    to?: string;
}

export function TournamentCard({ tournament, to = `/torneos/${tournament.slug}` }: TournamentCardProps) {
    const teams = tournament._count.registrations;
    const fill = Math.min(100, (teams / tournament.maxTeams) * 100);

    return (
        <Link
            to={to}
            className="flex flex-col gap-4 border border-line bg-surface p-5 transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-accent hover:shadow-[4px_4px_0_var(--color-accent)]"
        >
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-widest">
                <span className="bg-accent px-2 py-1 text-bg">{tournament.game.name}</span>
                <StatusBadge status={tournament.status} />
            </div>

            <h2 className="font-display text-3xl leading-none uppercase text-balance">{tournament.name}</h2>

            <dl className="mt-auto grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                    <dt className="text-xs font-bold uppercase tracking-widest text-muted">Empieza</dt>
                    <dd className="font-semibold first-letter:uppercase">{formatDate(tournament.startsAt)}</dd>
                </div>
                <div>
                    <dt className="text-xs font-bold uppercase tracking-widest text-muted">Formato</dt>
                    <dd className="font-semibold">
                        {tournament.teamSize}v{tournament.teamSize} · Al mejor de {tournament.bestOf}
                    </dd>
                </div>
                <div className="col-span-2">
                    <dt className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted">
                        Equipos
                        <span className="text-fg tabular-nums">
                            {teams}/{tournament.maxTeams}
                        </span>
                    </dt>
                    <dd className="mt-2 h-1.5 bg-surface-2">
                        <div className="h-full bg-accent" style={{ width: `${fill}%` }} />
                    </dd>
                </div>
            </dl>

            <p className="text-sm text-muted">Organiza {tournament.organizer.displayName}</p>
        </Link>
    );
}
