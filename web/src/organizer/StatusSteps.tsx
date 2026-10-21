import type { TournamentStatus } from "../api/types";

const STEPS: { status: TournamentStatus; label: string }[] = [
    { status: "DRAFT", label: "Borrador" },
    { status: "REGISTRATION", label: "Inscripciones" },
    { status: "IN_PROGRESS", label: "En curso" },
    { status: "FINISHED", label: "Terminado" },
];

export function StatusSteps({ status }: { status: TournamentStatus }) {
    const current = STEPS.findIndex((step) => step.status === status);

    return (
        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {STEPS.map((step, index) => {
                const done = index < current;
                const active = index === current;
                return (
                    <li
                        key={step.status}
                        aria-current={active ? "step" : undefined}
                        className={`flex items-center gap-3 border-t-3 pt-3 text-sm font-bold uppercase tracking-wider ${
                            index <= current ? "border-accent" : "border-line-strong text-muted"
                        }`}
                    >
                        <span
                            className={`grid size-7 shrink-0 place-items-center rounded-full border-2 text-xs ${
                                done
                                    ? "border-accent bg-accent text-bg"
                                    : active
                                      ? "border-accent"
                                      : "border-line-strong"
                            }`}
                        >
                            {index + 1}
                        </span>
                        {step.label}
                    </li>
                );
            })}
        </ol>
    );
}
