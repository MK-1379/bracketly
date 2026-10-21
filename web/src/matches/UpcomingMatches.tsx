import { Link } from "react-router";
import { buttonClass } from "../components/buttonClass";
import { roundName } from "../utils/bracket";
import { type MyMatch, totalRounds } from "./matches.api";
import { useMyMatches } from "./useMatches";

function matchStatusText(match: MyMatch) {
    if (match.status === "REPORTED") {
        return `Reportado ${match.scoreA} – ${match.scoreB} por ${match.reportedBy?.displayName ?? "un capitán"}. Falta que lo confirme el organizador.`;
    }
    return "Por jugar";
}

export function UpcomingMatches() {
    const matches = useMyMatches();

    if (matches.isPending) {
        return <div className="h-24 border border-line bg-surface motion-safe:animate-pulse" />;
    }

    if (matches.isError) {
        return (
            <p role="alert" className="text-live">
                No se han podido cargar tus partidos. Recarga la página.
            </p>
        );
    }

    if (matches.data.length === 0) {
        return <p className="text-muted">No tienes partidos pendientes ahora mismo.</p>;
    }

    return (
        <ul className="flex flex-col gap-3">
            {matches.data.map((match) => (
                <li
                    key={match.id}
                    className={`flex flex-wrap items-center justify-between gap-4 border bg-surface p-4 ${
                        match.status === "REPORTED" ? "border-line" : "border-accent"
                    }`}
                >
                    <div className="flex min-w-0 flex-col gap-1">
                        <span className="text-xs font-bold uppercase tracking-widest text-muted">
                            <Link to={`/torneos/${match.tournament.slug}`} className="hover:text-fg">
                                {match.tournament.name}
                            </Link>{" "}
                            · {roundName(match.round, totalRounds(match))} · Al mejor de {match.tournament.bestOf}
                        </span>
                        <strong className="font-display text-2xl leading-tight uppercase">
                            {match.teamA?.name} <span className="text-muted">vs</span> {match.teamB?.name}
                        </strong>
                        <span className={`text-sm ${match.status === "REPORTED" ? "text-muted" : "text-accent"}`}>
                            {matchStatusText(match)}
                        </span>
                    </div>
                    {match.canReport && (
                        <Link
                            to={`/partidos/${match.id}/reportar`}
                            className={buttonClass(match.status === "REPORTED" ? "outline" : "primary")}
                        >
                            {match.status === "REPORTED" ? "Corregir resultado" : "Reportar resultado"}
                        </Link>
                    )}
                </li>
            ))}
        </ul>
    );
}
