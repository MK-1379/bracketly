import type { Match } from "../api/types";
import { isBye, roundName } from "../utils/bracket";

export function MatchList({ matches }: { matches: Match[] }) {
    const totalRounds = Math.max(...matches.map((match) => match.round));
    const played = matches.filter((match) => !isBye(match));

    return (
        <ul className="border border-line">
            {played.map((match) => (
                <li
                    key={match.id}
                    className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-line px-4 py-3.5 last:border-b-0 sm:grid-cols-[140px_1fr_auto_1fr]"
                >
                    <span className="col-span-full text-xs font-bold uppercase tracking-widest text-muted sm:col-span-1">
                        {roundName(match.round, totalRounds)}
                    </span>
                    <span className="truncate">{match.teamA?.name ?? "Por decidir"}</span>
                    <span className="font-display text-xl text-accent tabular-nums">
                        {match.scoreA === null ? "vs" : `${match.scoreA} – ${match.scoreB}`}
                    </span>
                    <span className="truncate text-right">{match.teamB?.name ?? "Por decidir"}</span>
                </li>
            ))}
        </ul>
    );
}
