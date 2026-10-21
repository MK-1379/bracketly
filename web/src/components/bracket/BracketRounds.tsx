import { useState } from "react";
import type { Match, TeamSummary } from "../../api/types";
import { roundName } from "../../utils/bracket";
import { ChampionCard } from "./ChampionCard";
import { MatchCard } from "./MatchCard";

function defaultRound(matches: Match[], totalRounds: number) {
    const playable = matches.find((match) => match.status === "READY" || match.status === "REPORTED");
    return playable?.round ?? totalRounds;
}

interface BracketRoundsProps {
    matches: Match[];
    champion: TeamSummary | null;
}

export function BracketRounds({ matches, champion }: BracketRoundsProps) {
    const totalRounds = Math.max(...matches.map((match) => match.round));
    const [round, setRound] = useState(() => defaultRound(matches, totalRounds));
    const rounds = Array.from({ length: totalRounds }, (_, index) => index + 1);
    const roundMatches = matches.filter((match) => match.round === round);

    return (
        <div className="flex flex-col gap-4">
            <fieldset className="flex gap-2 overflow-x-auto">
                <legend className="sr-only">Rondas</legend>
                {rounds.map((item) => (
                    <button
                        key={item}
                        type="button"
                        aria-pressed={item === round}
                        onClick={() => setRound(item)}
                        className={`min-h-11 shrink-0 border-2 px-4 font-display text-lg uppercase transition-colors ${
                            item === round ? "border-accent bg-accent text-bg" : "border-line-strong text-muted"
                        }`}
                    >
                        {String(item).padStart(2, "0")} · {roundName(item, totalRounds)}
                    </button>
                ))}
            </fieldset>

            <ul key={round} className="flex flex-col gap-3">
                {roundMatches.map((match, index) => (
                    <li
                        key={match.id}
                        className="motion-safe:animate-enter"
                        style={{ animationDelay: `${index * 0.06}s` }}
                    >
                        <MatchCard match={match} />
                    </li>
                ))}
            </ul>

            {round === totalRounds && <ChampionCard champion={champion} style={{ height: 150 }} />}
        </div>
    );
}
