import { Link, useParams } from "react-router";
import { PanelSection } from "../components/PanelSection";
import { InviteLink } from "../teams/InviteLink";
import { MemberList } from "../teams/MemberList";
import { TeamBadge } from "../teams/TeamBadge";
import { TeamRegistrations } from "../teams/TeamRegistrations";
import { useMyTeam } from "../teams/useTeams";

export function TeamPanelPage() {
    const { id } = useParams();
    const { data: team, isPending, isError } = useMyTeam(Number(id));

    if (isPending) {
        return <div className="mx-auto h-64 max-w-6xl px-4 py-10" aria-busy="true" />;
    }

    if (isError) {
        return (
            <p role="alert" className="mx-auto max-w-6xl px-4 py-10 text-live">
                No se ha podido cargar el equipo. Recarga la página.
            </p>
        );
    }

    if (!team) {
        return (
            <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-10">
                <title>Equipo no encontrado · Bracketly</title>
                <h1 className="font-display text-5xl uppercase">Equipo no encontrado</h1>
                <p className="text-muted">No perteneces a este equipo o ya no existe.</p>
                <Link to="/panel" className="font-bold text-accent underline underline-offset-4">
                    Volver a mi panel
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10">
            <title>{`${team.name} · Bracketly`}</title>
            <div className="flex flex-col gap-4">
                <Link
                    to="/panel"
                    className="self-start text-sm font-bold uppercase tracking-widest text-muted hover:text-fg"
                >
                    ← Mi panel
                </Link>
                <div className="flex flex-wrap items-center gap-6">
                    <TeamBadge teamId={team.id} tag={team.tag} size="lg" />
                    <div>
                        <h1 className="font-display text-5xl leading-none uppercase sm:text-7xl">{team.name}</h1>
                        <p className="mt-2 text-muted">Capitán: {team.captain.displayName}</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-10 lg:grid-cols-[3fr_2fr] lg:items-start">
                <div className="flex flex-col gap-10">
                    <PanelSection title={`Jugadores (${team.members.length})`}>
                        <MemberList team={team} />
                    </PanelSection>
                    <PanelSection title="Torneos">
                        <TeamRegistrations team={team} />
                    </PanelSection>
                </div>

                {team.isCaptain && (
                    <PanelSection title="Invitar">
                        <InviteLink team={team} />
                    </PanelSection>
                )}
            </div>
        </div>
    );
}
