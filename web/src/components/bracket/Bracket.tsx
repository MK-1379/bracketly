import type { Match, TeamSummary } from "../../api/types";
import {
    CARD_HEIGHT,
    COLUMN_GAP,
    columnX,
    connectorPath,
    HEADER_HEIGHT,
    matchCenterY,
    roundName,
    SLOT_HEIGHT,
    teamColor,
    winnerOf,
} from "../../utils/bracket";
import { MatchCard } from "./MatchCard";

const CHAMPION_WIDTH = 220;

interface BracketProps {
    matches: Match[];
    champion: TeamSummary | null;
}

export function Bracket({ matches, champion }: BracketProps) {
    const totalRounds = Math.max(...matches.map((match) => match.round));
    const firstRoundMatches = matches.filter((match) => match.round === 1).length;
    const rounds = Array.from({ length: totalRounds }, (_, index) => index + 1);
    const byId = new Map(matches.map((match) => [match.id, match]));

    const championX = columnX(totalRounds + 1);
    const width = championX + CHAMPION_WIDTH;
    const height = HEADER_HEIGHT + firstRoundMatches * SLOT_HEIGHT;
    const finalCenterY = matchCenterY(totalRounds, 1);

    return (
        <div className="overflow-x-auto pb-3">
            <div className="relative" style={{ width, height }}>
                {rounds.map((round) => (
                    <h3
                        key={round}
                        className="absolute top-0 font-display text-lg uppercase tracking-wide text-muted"
                        style={{ left: columnX(round) }}
                    >
                        {String(round).padStart(2, "0")} · {roundName(round, totalRounds)}
                    </h3>
                ))}
                <h3
                    className="absolute top-0 font-display text-lg uppercase tracking-wide text-muted"
                    style={{ left: championX }}
                >
                    Campeón
                </h3>

                <svg className="pointer-events-none absolute inset-0" width={width} height={height} aria-hidden="true">
                    {matches.map((match) => {
                        const winner = winnerOf(match);
                        return (
                            <path
                                key={match.id}
                                d={connectorPath(
                                    match,
                                    match.nextMatchId ? byId.get(match.nextMatchId) : undefined,
                                    championX,
                                )}
                                fill="none"
                                strokeWidth={2}
                                className={winner ? "stroke-accent" : "stroke-line-strong"}
                            />
                        );
                    })}
                </svg>

                {matches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                ))}

                <div
                    className={`absolute flex flex-col justify-center gap-2 p-5 text-bg ${champion ? "bg-fg" : "bg-accent"}`}
                    style={{
                        left: championX,
                        top: finalCenterY - CARD_HEIGHT / 2 - 20,
                        width: CHAMPION_WIDTH - COLUMN_GAP / 2,
                        minHeight: CARD_HEIGHT + 40,
                    }}
                >
                    {champion ? (
                        <>
                            <span className="text-xs font-bold uppercase tracking-widest">Campeón</span>
                            <span className="font-display text-3xl leading-none uppercase">{champion.name}</span>
                            <span className="h-2 w-full" style={{ backgroundColor: teamColor(champion.id) }} />
                        </>
                    ) : (
                        <span className="font-display text-3xl leading-none uppercase">¿Quién levanta la copa?</span>
                    )}
                </div>
            </div>
        </div>
    );
}