import { TournamentCard } from "../components/TournamentCard";
import { useMyTournaments } from "./useOrganizer";

export function MyTournaments() {
    const tournaments = useMyTournaments();

    if (tournaments.isPending) {
        return <div className="h-24 border border-line bg-surface motion-safe:animate-pulse" />;
    }

    if (tournaments.isError) {
        return (
            <p role="alert" className="text-live">
                No se han podido cargar tus torneos. Recarga la página.
            </p>
        );
    }

    if (tournaments.data.length === 0) {
        return (
            <p className="border border-dashed border-line-strong p-8 text-center text-muted">
                Todavía no organizas ningún torneo. Crea uno y comparte el enlace con los capitanes.
            </p>
        );
    }

    return (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tournaments.data.map((tournament) => (
                <li key={tournament.id} className="grid">
                    <TournamentCard tournament={tournament} to={`/panel/torneos/${tournament.slug}`} />
                </li>
            ))}
        </ul>
    );
}