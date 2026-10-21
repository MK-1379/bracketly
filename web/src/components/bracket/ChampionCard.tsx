import type { CSSProperties } from "react";
import type { TeamSummary } from "../../api/types";
import { teamColor } from "../../utils/bracket";
import { Confetti } from "../Confetti";

const FLIP_DELAY = 1400;

interface ChampionCardProps {
    champion: TeamSummary | null;
    style?: CSSProperties;
}

export function ChampionCard({ champion, style }: ChampionCardProps) {
    return (
        <div className="perspective-[900px]" style={style}>
            <div
                className={`relative size-full transform-3d ${champion ? "rotate-y-180 motion-safe:animate-flip" : ""}`}
                style={champion ? { animationDelay: `${FLIP_DELAY}ms` } : undefined}
            >
                <div className="absolute inset-0 flex flex-col justify-center gap-2 bg-accent p-5 text-bg backface-hidden">
                    <span className="font-display text-3xl leading-none uppercase">¿Quién levanta la copa?</span>
                </div>
                {champion && (
                    <div className="absolute inset-0 flex rotate-y-180 flex-col justify-center gap-2 bg-fg p-5 text-bg backface-hidden">
                        <span className="text-xs font-bold uppercase tracking-widest">Campeón</span>
                        <span className="font-display text-3xl leading-none uppercase">{champion.name}</span>
                        <span className="h-2 w-full" style={{ backgroundColor: teamColor(champion.id) }} />
                    </div>
                )}
            </div>
            {champion && <Confetti teamColor={teamColor(champion.id)} delay={FLIP_DELAY + 500} />}
        </div>
    );
}
