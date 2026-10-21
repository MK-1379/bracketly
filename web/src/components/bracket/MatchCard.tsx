import type { CSSProperties } from "react";
import type { Match, TeamSummary } from "../../api/types";
import { CARD_HEIGHT, isBye, teamColor } from "../../utils/bracket";

const STATUS_TEXT: Record<Match["status"], string> = {
    PENDING: "Por decidir",
    READY: "Listo para jugar",
    REPORTED: "Pendiente de confirmar",
    CONFIRMED: "Finalizado",
};

interface TeamRowProps {
    team: TeamSummary | null;
    score: number | null;
    result: "win" | "lose" | null;
    emptyLabel: string;
    highlighted: boolean;
    onHighlight?: (teamId: number | null) => void;
}

function TeamRow({ team, score, result, emptyLabel, highlighted, onHighlight }: TeamRowProps) {
    const color = team ? teamColor(team.id) : "var(--color-line-strong)";
    const nameClass = `truncate text-[15px] uppercase tracking-wide ${
        team ? (result === "win" ? "font-extrabold" : "font-semibold") : "text-muted"
    } ${result === "lose" ? "text-muted" : ""}`;

    return (
        <div
            className={`flex h-10 items-stretch border-b border-line transition-[background-color,opacity] ${
                result === "lose" && !highlighted ? "opacity-70" : ""
            }`}
            style={highlighted ? { backgroundColor: `color-mix(in srgb, ${color} 22%, transparent)` } : undefined}
        >
            <span className="flex min-w-0 flex-1 items-center gap-2.5 px-3">
                <span
                    className={`w-1.5 shrink-0 transition-[height] ${highlighted ? "h-full" : "h-5"}`}
                    style={{ backgroundColor: color }}
                />
                {team && onHighlight ? (
                    <button
                        type="button"
                        title={`Ver el camino de ${team.name}`}
                        onMouseEnter={() => onHighlight(team.id)}
                        onMouseLeave={() => onHighlight(null)}
                        onFocus={() => onHighlight(team.id)}
                        onBlur={() => onHighlight(null)}
                        className={`min-w-0 text-left ${nameClass}`}
                    >
                        {team.name}
                    </button>
                ) : (
                    <span className={nameClass}>{team ? team.name : emptyLabel}</span>
                )}
            </span>
            <span
                className={`flex w-10 items-center justify-center font-display text-lg tabular-nums ${
                    result === "win" ? "bg-accent text-bg" : "bg-surface-2"
                } ${result === "lose" ? "text-muted" : ""}`}
            >
                {score ?? "–"}
            </span>
        </div>
    );
}

interface MatchCardProps {
    match: Match;
    highlightedTeam?: number | null;
    onHighlight?: (teamId: number | null) => void;
    className?: string;
    style?: CSSProperties;
}

export function MatchCard({ match, highlightedTeam = null, onHighlight, className = "", style }: MatchCardProps) {
    const bye = isBye(match);
    const finished = match.status === "CONFIRMED" && match.winnerTeamId !== null;
    const hasHighlight = highlightedTeam !== null;
    const containsHighlight = hasHighlight && [match.teamA?.id, match.teamB?.id].includes(highlightedTeam);

    function resultFor(team: TeamSummary | null) {
        if (!finished || bye || !team) {
            return null;
        }
        return team.id === match.winnerTeamId ? "win" : "lose";
    }

    function row(team: TeamSummary | null, score: number | null) {
        return (
            <TeamRow
                team={team}
                score={score}
                result={resultFor(team)}
                emptyLabel={bye ? "—" : "Por decidir"}
                highlighted={hasHighlight && team?.id === highlightedTeam}
                onHighlight={onHighlight}
            />
        );
    }

    return (
        <article
            className={`transition-[opacity,border-color,transform] duration-300 ${
                match.status === "PENDING"
                    ? "border-2 border-dashed border-line-strong"
                    : "border border-line bg-surface hover:-translate-y-0.5 hover:border-line-strong"
            } ${bye ? "opacity-60" : ""} ${hasHighlight && !containsHighlight ? "opacity-40" : ""} ${className}`}
            style={{ height: CARD_HEIGHT, ...style }}
        >
            {row(match.teamA, match.scoreA)}
            {row(match.teamB, match.scoreB)}
            <p className="flex h-6 items-center px-3 text-[11px] font-bold uppercase tracking-widest text-muted">
                {bye ? "Pase directo" : STATUS_TEXT[match.status]}
            </p>
        </article>
    );
}
