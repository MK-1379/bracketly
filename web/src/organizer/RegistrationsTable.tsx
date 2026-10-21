import type { TournamentDetail } from "../api/types";
import { Button } from "../components/Button";
import type { RegistrationStatus } from "../teams/teams.api";
import type { ManagedRegistration } from "./organizer.api";
import { useReviewRegistration } from "./useOrganizer";

const STATUS_LABELS: Record<RegistrationStatus, { text: string; className: string }> = {
    PENDING: { text: "Pendiente", className: "text-fg" },
    ACCEPTED: { text: "Aceptado", className: "text-accent" },
    REJECTED: { text: "Rechazado", className: "text-muted" },
};

interface RegistrationsTableProps {
    tournament: TournamentDetail;
    registrations: ManagedRegistration[];
}

export function RegistrationsTable({ tournament, registrations }: RegistrationsTableProps) {
    const review = useReviewRegistration(tournament.slug);
    const canReview = tournament.status === "REGISTRATION";
    const full = tournament._count.registrations >= tournament.maxTeams;

    if (registrations.length === 0) {
        return (
            <p className="border border-dashed border-line-strong p-8 text-center text-muted">
                {tournament.status === "DRAFT"
                    ? "Abre las inscripciones para que los capitanes puedan apuntar a sus equipos."
                    : "Todavía no se ha inscrito ningún equipo."}
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="overflow-x-auto border border-line">
                <table className="w-full min-w-[640px] text-left">
                    <thead className="bg-surface-2 text-xs font-bold uppercase tracking-widest text-muted">
                        <tr>
                            <th scope="col" className="px-4 py-3">
                                Equipo
                            </th>
                            <th scope="col" className="px-4 py-3">
                                Capitán
                            </th>
                            <th scope="col" className="px-4 py-3">
                                Jugadores
                            </th>
                            <th scope="col" className="px-4 py-3">
                                Estado
                            </th>
                            {canReview && (
                                <th scope="col" className="px-4 py-3">
                                    <span className="sr-only">Acciones</span>
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {registrations.map(({ status, team }) => {
                            const label = STATUS_LABELS[status];
                            const missing = team._count.members < tournament.teamSize;
                            const pending = review.isPending && review.variables.teamId === team.id;
                            return (
                                <tr key={team.id} className="border-t border-line bg-surface">
                                    <th scope="row" className="px-4 py-3 font-bold uppercase tracking-wide">
                                        {team.name}
                                    </th>
                                    <td className="px-4 py-3 text-muted">{team.captain.displayName}</td>
                                    <td className={`px-4 py-3 tabular-nums ${missing ? "text-live" : ""}`}>
                                        {team._count.members}/{tournament.teamSize}
                                    </td>
                                    <td
                                        className={`px-4 py-3 text-xs font-bold uppercase tracking-widest ${label.className}`}
                                    >
                                        {label.text}
                                    </td>
                                    {canReview && (
                                        <td className="px-4 py-2">
                                            <div className="flex justify-end gap-2">
                                                {status !== "ACCEPTED" && (
                                                    <Button
                                                        disabled={pending || full}
                                                        onClick={() =>
                                                            review.mutate({
                                                                slug: tournament.slug,
                                                                teamId: team.id,
                                                                status: "ACCEPTED",
                                                            })
                                                        }
                                                    >
                                                        Aceptar
                                                    </Button>
                                                )}
                                                {status !== "REJECTED" && (
                                                    <Button
                                                        variant="outline"
                                                        disabled={pending}
                                                        onClick={() =>
                                                            review.mutate({
                                                                slug: tournament.slug,
                                                                teamId: team.id,
                                                                status: "REJECTED",
                                                            })
                                                        }
                                                    >
                                                        Rechazar
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {canReview && full && (
                <p className="text-sm text-muted">
                    El torneo está lleno: rechaza a un equipo para poder aceptar a otro.
                </p>
            )}
            {review.isError && (
                <p role="alert" className="text-sm font-semibold text-live">
                    No se ha podido cambiar la inscripción. Inténtalo de nuevo.
                </p>
            )}
        </div>
    );
}