import { useState } from "react";
import type { Match, TeamSummary } from "../../api/types";
import {
    CARD_HEIGHT,
    CARD_WIDTH,
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
import { ChampionCard } from "./ChampionCard";
import { MatchCard } from "./MatchCard";

const CHAMPION_WIDTH = 220;

function entranceDelay(round: number, position: number) {
    return `${0.15 + round * 0.2 + position * 0.05}s`;
}

interface BracketProps {
    matches: Match[];
    champion: TeamSummary | null;
}

export function Bracket({ matches, champion }: BracketProps) {
    const [highlightedTeam, setHighlightedTeam] = useState<number | null>(null);

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
                        const highlighted = highlightedTeam !== null && winner?.id === highlightedTeam;
                        const dimmed = highlightedTeam !== null && !highlighted;
                        return (
                            <path
                                key={match.id}
                                d={connectorPath(
                                    match,
                                    match.nextMatchId ? byId.get(match.nextMatchId) : undefined,
                                    championX,
                                )}
                                pathLength={1}
                                fill="none"
                                strokeWidth={highlighted ? 3 : 2}
                                className={`transition-[stroke,opacity] duration-300 motion-safe:animate-draw ${
                                    winner ? "stroke-accent" : "stroke-line-strong"
                                } ${dimmed ? "opacity-25" : ""}`}
                                style={{
                                    strokeDasharray: 1,
                                    stroke: highlighted && winner ? teamColor(winner.id) : undefined,
                                    animationDelay: `${0.6 + match.round * 0.25}s`,
                                }}
                            />
                        );
                    })}
                </svg>

                {matches.map((match) => (
                    <MatchCard
                        key={match.id}
                        match={match}
                        highlightedTeam={highlightedTeam}
                        onHighlight={setHighlightedTeam}
                        className="absolute motion-safe:animate-enter"
                        style={{
                            left: columnX(match.round),
                            top: matchCenterY(match.round, match.position) - CARD_HEIGHT / 2,
                            width: CARD_WIDTH,
                            animationDelay: entranceDelay(match.round, match.position),
                        }}
                    />
                ))}

                <ChampionCard
                    champion={champion}
                    style={{
                        position: "absolute",
                        left: championX,
                        top: finalCenterY - CARD_HEIGHT / 2 - 20,
                        width: CHAMPION_WIDTH - COLUMN_GAP / 2,
                        height: CARD_HEIGHT + 40,
                    }}
                />
            </div>
        </div>
    );
}
