import type { Match, TeamSummary } from "../../api/types";
import { CARD_HEIGHT, CARD_WIDTH, columnX, isBye, matchCenterY, teamColor } from "../../utils/bracket";

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
}

function TeamRow({ team, score, result, emptyLabel }: TeamRowProps) {
    return (
        <div className={`flex h-10 items-stretch border-b border-line ${result === "lose" ? "opacity-70" : ""}`}>
            <span className="flex min-w-0 flex-1 items-center gap-2.5 px-3">
                <span
                    className="h-5 w-1.5 shrink-0"
                    style={{ backgroundColor: team ? teamColor(team.id) : "var(--color-line-strong)" }}
                />
                <span
                    className={`truncate text-[15px] uppercase tracking-wide ${
                        team ? (result === "win" ? "font-extrabold" : "font-semibold") : "text-muted"
                    } ${result === "lose" ? "text-muted" : ""}`}
                >
                    {team ? team.name : emptyLabel}
                </span>
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

export function MatchCard({ match }: { match: Match }) {
    const bye = isBye(match);
    const finished = match.status === "CONFIRMED" && match.winnerTeamId !== null;

    function resultFor(team: TeamSummary | null) {
        if (!finished || bye || !team) {
            return null;
        }
        return team.id === match.winnerTeamId ? "win" : "lose";
    }

    return (
        <article
            className={`absolute ${match.status === "PENDING" ? "border-2 border-dashed border-line-strong" : "border border-line bg-surface"} ${bye ? "opacity-60" : ""}`}
            style={{
                left: columnX(match.round),
                top: matchCenterY(match.round, match.position) - CARD_HEIGHT / 2,
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
            }}
        >
            <TeamRow
                team={match.teamA}
                score={match.scoreA}
                result={resultFor(match.teamA)}
                emptyLabel={bye ? "—" : "Por decidir"}
            />
            <TeamRow
                team={match.teamB}
                score={match.scoreB}
                result={resultFor(match.teamB)}
                emptyLabel={bye ? "—" : "Por decidir"}
            />
            <p className="flex h-6 items-center px-3 text-[11px] font-bold uppercase tracking-widest text-muted">
                {bye ? "Pase directo" : STATUS_TEXT[match.status]}
            </p>
        </article>
    );
}