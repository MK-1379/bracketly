import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { ApiError } from "../api/client";
import { tournamentsQuery } from "../api/queries";
import { Button } from "../components/Button";
import { ConfirmButton } from "../components/ConfirmButton";
import { formatDate } from "../utils/format";
import type { MyTeam, RegistrationStatus } from "./teams.api";
import { useCancelRegistration, useRegisterTeam } from "./useTeams";

const REGISTRATION_LABELS: Record<RegistrationStatus, { text: string; className: string }> = {
    PENDING: { text: "Pendiente de revisión", className: "text-muted" },
    ACCEPTED: { text: "Aceptada", className: "text-accent" },
    REJECTED: { text: "Rechazada", className: "text-live" },
};

function registerErrorMessage(error: Error) {
    if (error instanceof ApiError && error.status === 409) {
        return "No se ha podido inscribir: las inscripciones ya están cerradas o faltan jugadores.";
    }
    return "No se ha podido completar la acción. Inténtalo de nuevo.";
}

export function TeamRegistrations({ team }: { team: MyTeam }) {
    const openTournaments = useQuery({ ...tournamentsQuery({ status: "REGISTRATION" }), enabled: team.isCaptain });
    const register = useRegisterTeam();
    const cancel = useCancelRegistration();

    const registeredSlugs = new Set(team.registrations.map((registration) => registration.tournament.slug));
    const available = (openTournaments.data ?? []).filter((tournament) => !registeredSlugs.has(tournament.slug));
    const error = register.error ?? cancel.error;

    return (
        <div className="flex flex-col gap-6">
            {team.registrations.length === 0 ? (
                <p className="text-muted">El equipo todavía no se ha inscrito en ningún torneo.</p>
            ) : (
                <ul className="flex flex-col border border-line">
                    {team.registrations.map(({ status, tournament }) => {
                        const label = REGISTRATION_LABELS[status];
                        return (
                            <li
                                key={tournament.slug}
                                className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3 last:border-b-0"
                            >
                                <span className="flex flex-col">
                                    <Link
                                        to={`/torneos/${tournament.slug}`}
                                        className="font-bold underline-offset-4 hover:underline"
                                    >
                                        {tournament.name}
                                    </Link>
                                    <span className={`text-xs font-bold uppercase tracking-widest ${label.className}`}>
                                        {label.text}
                                    </span>
                                </span>
                                {team.isCaptain && tournament.status === "REGISTRATION" && (
                                    <ConfirmButton
                                        label="Retirar"
                                        question="¿Retirar la inscripción?"
                                        pending={cancel.isPending && cancel.variables.slug === tournament.slug}
                                        onConfirm={() => cancel.mutate({ slug: tournament.slug, teamId: team.id })}
                                    />
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}

            {team.isCaptain && (
                <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted">
                        Torneos con inscripciones abiertas
                    </h3>
                    {openTournaments.isSuccess && available.length === 0 && (
                        <p className="text-muted">Ahora mismo no hay más torneos abiertos.</p>
                    )}
                    <ul className="grid gap-3 sm:grid-cols-2">
                        {available.map((tournament) => {
                            const missing = tournament.teamSize - team.members.length;
                            const pending = register.isPending && register.variables.slug === tournament.slug;
                            return (
                                <li
                                    key={tournament.slug}
                                    className="flex flex-col gap-3 border border-line bg-surface p-4"
                                >
                                    <span className="text-xs font-bold uppercase tracking-widest text-accent">
                                        {tournament.game.name}
                                    </span>
                                    <Link
                                        to={`/torneos/${tournament.slug}`}
                                        className="font-display text-2xl leading-none uppercase hover:text-accent"
                                    >
                                        {tournament.name}
                                    </Link>
                                    <span className="text-sm text-muted first-letter:uppercase">
                                        {formatDate(tournament.startsAt)} · {tournament.teamSize}v{tournament.teamSize}
                                    </span>
                                    {missing > 0 ? (
                                        <p className="text-sm text-muted">
                                            Te faltan {missing} {missing === 1 ? "jugador" : "jugadores"} para
                                            inscribirte.
                                        </p>
                                    ) : (
                                        <Button
                                            className="self-start"
                                            disabled={pending}
                                            onClick={() => register.mutate({ slug: tournament.slug, teamId: team.id })}
                                        >
                                            {pending ? "Inscribiendo..." : "Inscribir al equipo"}
                                        </Button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {error && (
                <p role="alert" className="border-2 border-live p-3 text-sm font-semibold text-live">
                    {registerErrorMessage(error)}
                </p>
            )}
        </div>
    );
}
