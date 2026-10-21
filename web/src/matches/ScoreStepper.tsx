import { teamColor } from "../utils/bracket";

interface ScoreStepperProps {
    teamId: number;
    teamName: string;
    value: number;
    max: number;
    isWinner: boolean;
    onChange: (value: number) => void;
}

const STEP_BUTTON =
    "grid size-11 place-items-center border-2 border-line-strong text-xl font-bold hover:border-accent disabled:pointer-events-none disabled:opacity-40";

export function ScoreStepper({ teamId, teamName, value, max, isWinner, onChange }: ScoreStepperProps) {
    return (
        <div className="flex items-center gap-3">
            <span className="h-7 w-1.5 shrink-0" style={{ backgroundColor: teamColor(teamId) }} />
            <span className="min-w-0 flex-1 truncate font-bold uppercase tracking-wide">{teamName}</span>
            <div className="flex">
                <button
                    type="button"
                    className={STEP_BUTTON}
                    disabled={value === 0}
                    aria-label={`Restar una partida a ${teamName}`}
                    onClick={() => onChange(value - 1)}
                >
                    −
                </button>
                <output
                    aria-label={`Partidas ganadas por ${teamName}`}
                    className={`grid h-11 w-12 place-items-center font-display text-3xl tabular-nums ${
                        isWinner ? "bg-accent text-bg" : "bg-surface-2"
                    }`}
                >
                    {value}
                </output>
                <button
                    type="button"
                    className={STEP_BUTTON}
                    disabled={value === max}
                    aria-label={`Sumar una partida a ${teamName}`}
                    onClick={() => onChange(value + 1)}
                >
                    +
                </button>
            </div>
        </div>
    );
}
