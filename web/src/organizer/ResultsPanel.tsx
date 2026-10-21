import type { Match, TournamentDetail } from "../api/types";
import { ResultRow } from "./ResultRow";

interface ResultsPanelProps {
    tournament: TournamentDetail;
    matches: Match[];
}

export function ResultsPanel({ tournament, matches }: ResultsPanelProps) {
    const totalRounds = Math.max(0, ...matches.map((match) => match.round));
    const reported = matches.filter((match) => match.status === "REPORTED");
    const ready = matches.filter((match) => match.status === "READY");

    if (reported.length === 0 && ready.length === 0) {
        return <p className="text-muted">No hay partidos esperando resultado.</p>;
    }

    const renderRow = (match: Match) => (
        <ResultRow
            key={match.id}
            match={match}
            slug={tournament.slug}
            bestOf={tournament.bestOf}
            totalRounds={totalRounds}
        />
    );

    return (
        <div className="flex flex-col gap-6">
            {reported.length > 0 && (
                <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-accent">Por validar</h3>
                    <ul className="flex flex-col gap-3">{reported.map(renderRow)}</ul>
                </div>
            )}
            {ready.length > 0 && (
                <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted">Por jugar</h3>
                    <ul className="flex flex-col gap-3">{ready.map(renderRow)}</ul>
                </div>
            )}
        </div>
    );
}
