import { Link, useParams } from "react-router";
import { totalRounds } from "../matches/matches.api";
import { ReportForm } from "../matches/ReportForm";
import { useMyMatch } from "../matches/useMatches";
import { roundName } from "../utils/bracket";

export function ReportMatchPage() {
    const { id } = useParams();
    const { data: match, isPending, isError } = useMyMatch(Number(id));

    if (isPending) {
        return <div className="mx-auto h-64 max-w-xl px-4 py-10" aria-busy="true" />;
    }

    if (isError) {
        return (
            <p role="alert" className="mx-auto max-w-xl px-4 py-10 text-live">
                No se ha podido cargar el partido. Recarga la página.
            </p>
        );
    }

    if (!match?.canReport) {
        return (
            <div className="mx-auto flex max-w-xl flex-col items-start gap-4 px-4 py-10">
                <title>Partido no disponible · Bracketly</title>
                <h1 className="font-display text-5xl uppercase">Partido no disponible</h1>
                <p className="text-muted">
                    Solo los capitanes pueden reportar, y solo mientras el partido está pendiente de resultado.
                </p>
                <Link to="/panel" className="font-bold text-accent underline underline-offset-4">
                    Volver a mi panel
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10">
            <title>Reportar resultado · Bracketly</title>
            <Link
                to={`/torneos/${match.tournament.slug}`}
                className="self-start text-sm font-bold uppercase tracking-widest text-accent hover:underline"
            >
                ← Volver al torneo
            </Link>
            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted">
                    {roundName(match.round, totalRounds(match))} · Al mejor de {match.tournament.bestOf}
                </p>
                <h1 className="font-display text-5xl leading-none uppercase sm:text-6xl">Reportar resultado</h1>
            </div>
            <ReportForm match={match} />
        </div>
    );
}
