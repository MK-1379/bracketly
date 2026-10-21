import type { Match } from "../api/types";
import { isBye, roundName } from "../utils/bracket";

function tickerItems(matches: Match[]) {
    const totalRounds = Math.max(...matches.map((match) => match.round));
    const items: string[] = [];

    for (const match of matches) {
        if (!match.teamA || !match.teamB || isBye(match)) {
            continue;
        }
        const round = roundName(match.round, totalRounds);
        if (match.status === "CONFIRMED") {
            items.push(`${round} · ${match.teamA.name} ${match.scoreA} – ${match.scoreB} ${match.teamB.name}`);
        } else {
            items.push(`Próximo · ${round} · ${match.teamA.name} vs ${match.teamB.name}`);
        }
    }
    return items.reverse();
}

function TickerList({ items, hidden = false }: { items: string[]; hidden?: boolean }) {
    return (
        <ul className="flex shrink-0" aria-hidden={hidden || undefined}>
            {items.map((item) => (
                <li
                    key={item}
                    className="flex items-center py-2.5 font-display text-xl whitespace-nowrap uppercase after:mx-6 after:font-body after:text-sm after:content-['✦']"
                >
                    {item}
                </li>
            ))}
        </ul>
    );
}

export function ResultsTicker({ matches }: { matches: Match[] }) {
    const items = tickerItems(matches);
    if (items.length === 0) {
        return null;
    }

    return (
        <section
            aria-label="Resultados del torneo"
            className="group -rotate-1 overflow-hidden border-y-[3px] border-bg bg-accent text-bg shadow-[0_0_0_2px_var(--color-accent)] motion-reduce:overflow-x-auto"
        >
            <div className="flex w-max motion-safe:animate-ticker group-hover:[animation-play-state:paused]">
                <TickerList items={items} />
                <TickerList items={items} hidden />
            </div>
        </section>
    );
}
