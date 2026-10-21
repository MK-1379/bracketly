import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import { tournamentQuery } from "../api/queries";
import { useCurrentUser } from "../auth/useAuth";
import { buttonClass } from "../components/buttonClass";
import { PanelSection } from "../components/PanelSection";
import { RegistrationsTable } from "../organizer/RegistrationsTable";
import { StatCard } from "../organizer/StatCard";
import { StatusSteps } from "../organizer/StatusSteps";
import { TournamentActions } from "../organizer/TournamentActions";
import { useRegistrations } from "../organizer/useOrganizer";
import { formatDate } from "../utils/format";

export function ManageTournamentPage() {
    const { slug = "" } = useParams();
    const { data: user } = useCurrentUser();
    const tournament = useQuery(tournamentQuery(slug));
    const isOrganizer = tournament.data?.organizer.id === user?.id;
    const registrations = useRegistrations(slug, isOrganizer);

    if (tournament.isPending) {
        return <div className="mx-auto h-64 max-w-6xl px-4 py-10" aria-busy="true" />;
    }

    if (tournament.isError || !isOrganizer) {
        return (
            <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-10">
                <title>Torneo no disponible · Bracketly</title>
                <h1 className="font-display text-5xl uppercase">Torneo no disponible</h1>
                <p className="text-muted">No existe o no eres su organizador.</p>
                <Link to="/panel" className="font-bold text-accent underline underline-offset-4">
                    Volver a mi panel
                </Link>
            </div>
        );
    }

    const data = tournament.data;
    const pending = registrations.data?.filter((registration) => registration.status === "PENDING").length ?? 0;

    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10">
            <title>{`${data.name} · Panel del organizador · Bracketly`}</title>
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted">
                        <Link to="/panel" className="hover:text-fg">
                            Mi panel
                        </Link>{" "}
                        · Panel del organizador · {data.game.name}
                    </p>
                    <h1 className="font-display text-5xl leading-none uppercase sm:text-6xl">{data.name}</h1>
                </div>
                <Link to={`/torneos/${data.slug}`} className={buttonClass("outline")}>
                    Ver página pública
                </Link>
            </div>

            <StatusSteps status={data.status} />

            <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard label="Equipos aceptados" value={`${data._count.registrations}/${data.maxTeams}`} />
                <StatCard label="Por revisar" value={String(pending)} highlight={pending > 0} />
                <StatCard label="Formato" value={`${data.teamSize}v${data.teamSize} · BO${data.bestOf}`} />
                <StatCard label="Empieza" value={formatDate(data.startsAt)} />
            </dl>

            <PanelSection title="Estado del torneo">
                <TournamentActions tournament={data} />
            </PanelSection>

            <PanelSection title="Inscripciones">
                {registrations.isPending && (
                    <div className="h-24 border border-line bg-surface motion-safe:animate-pulse" />
                )}
                {registrations.isError && (
                    <p role="alert" className="text-live">
                        No se han podido cargar las inscripciones. Recarga la página.
                    </p>
                )}
                {registrations.isSuccess && <RegistrationsTable tournament={data} registrations={registrations.data} />}
            </PanelSection>
        </div>
    );
}
