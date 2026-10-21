import { Link } from "react-router";
import { useCurrentUser } from "../auth/useAuth";
import { buttonClass } from "../components/buttonClass";
import { PanelSection } from "../components/PanelSection";
import { UpcomingMatches } from "../matches/UpcomingMatches";
import { MyTournaments } from "../organizer/MyTournaments";
import { TeamCard } from "../teams/TeamCard";
import { useMyTeams } from "../teams/useTeams";

export function PanelPage() {
    const { data: user } = useCurrentUser();
    const teams = useMyTeams();

    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10">
            <title>Mi panel · Bracketly</title>
            <h1 className="font-display text-6xl leading-none uppercase sm:text-8xl">
                Hola,
                <span className="block text-accent">{user?.displayName}</span>
            </h1>

            <PanelSection title="Próximos partidos">
                <UpcomingMatches />
            </PanelSection>

            <PanelSection
                title="Mis torneos"
                action={
                    <Link to="/panel/torneos/nuevo" className={buttonClass("primary")}>
                        Crear torneo
                    </Link>
                }
            >
                <MyTournaments />
            </PanelSection>

            <PanelSection
                title="Mis equipos"
                action={
                    <Link to="/panel/equipos/nuevo" className={buttonClass("primary")}>
                        Crear equipo
                    </Link>
                }
            >
                {teams.isPending && <div className="h-24 border border-line bg-surface motion-safe:animate-pulse" />}

                {teams.isError && (
                    <p role="alert" className="text-live">
                        No se han podido cargar tus equipos. Recarga la página.
                    </p>
                )}

                {teams.isSuccess && teams.data.length === 0 && (
                    <p className="border border-dashed border-line-strong p-8 text-center text-muted">
                        Todavía no estás en ningún equipo. Crea uno o pide a tu capitán el enlace de invitación.
                    </p>
                )}

                {teams.isSuccess && teams.data.length > 0 && (
                    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {teams.data.map((team) => (
                            <li key={team.id} className="grid">
                                <TeamCard team={team} />
                            </li>
                        ))}
                    </ul>
                )}
            </PanelSection>
        </div>
    );
}