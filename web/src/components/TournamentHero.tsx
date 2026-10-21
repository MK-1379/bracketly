import type { TournamentDetail } from "../api/types";
import { formatDate } from "../utils/format";
import { StatusBadge } from "./StatusBadge";

function splitTitle(name: string) {
    const words = name.split(" ");
    const middle = Math.ceil(words.length / 2);
    return [words.slice(0, middle).join(" "), words.slice(middle).join(" ")];
}

export function TournamentHero({ tournament }: { tournament: TournamentDetail }) {
    const [firstLine, secondLine] = splitTitle(tournament.name);

    return (
        <section className="flex flex-col gap-4 py-10">
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-widest">
                <span className="bg-accent px-2.5 py-1.5 text-bg">{tournament.game.name}</span>
                <StatusBadge status={tournament.status} />
                <span className="text-muted first-letter:uppercase">{formatDate(tournament.startsAt)}</span>
            </div>
            <h1 className="font-display text-6xl leading-none uppercase text-balance sm:text-8xl">
                <span className="-mt-[0.15em] block overflow-hidden pt-[0.15em] pb-[0.04em]">
                    <span className="inline-block motion-safe:animate-rise">{firstLine}</span>
                </span>
                {secondLine && (
                    <span className="-mt-[0.15em] block overflow-hidden pt-[0.15em] pb-[0.04em]">
                        <span className="inline-block text-accent motion-safe:animate-rise [animation-delay:0.12s]">
                            {secondLine}
                        </span>
                    </span>
                )}
            </h1>
            <p className="max-w-prose text-muted">
                Organiza <strong className="text-fg">{tournament.organizer.displayName}</strong> ·{" "}
                {tournament._count.registrations}/{tournament.maxTeams} equipos · {tournament.teamSize}v
                {tournament.teamSize} · Eliminación directa · Al mejor de {tournament.bestOf}
            </p>
        </section>
    );
}
