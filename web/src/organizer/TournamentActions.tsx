import { useNavigate } from "react-router";
import { ApiError } from "../api/client";
import type { TournamentDetail } from "../api/types";
import { Button } from "../components/Button";
import { ConfirmButton } from "../components/ConfirmButton";
import { useDeleteTournament, useOpenTournament, useStartTournament } from "./useOrganizer";

function actionErrorMessage(error: Error) {
    if (error instanceof ApiError && error.status === 409) {
        return "No se puede hacer ahora mismo: puede que el torneo ya haya cambiado de estado. Recarga la página.";
    }
    return "No se ha podido completar la acción. Inténtalo de nuevo.";
}

export function TournamentActions({ tournament }: { tournament: TournamentDetail }) {
    const navigate = useNavigate();
    const open = useOpenTournament(tournament.slug);
    const start = useStartTournament(tournament.slug);
    const remove = useDeleteTournament();
    const accepted = tournament._count.registrations;
    const error = open.error ?? start.error ?? remove.error;

    if (tournament.status === "IN_PROGRESS" || tournament.status === "FINISHED") {
        return (
            <p className="text-muted">
                {tournament.status === "IN_PROGRESS"
                    ? "El torneo está en marcha. El cuadro se actualiza cada vez que confirmas un resultado."
                    : `Torneo terminado. Campeón: ${tournament.winnerTeam?.name ?? "—"}.`}
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-4 border border-line bg-surface p-5">
            {tournament.status === "DRAFT" ? (
                <>
                    <p className="text-muted">
                        Es un borrador: no sale en la lista de torneos. Ábrelo cuando esté listo para que los capitanes
                        puedan inscribirse.
                    </p>
                    <Button
                        className="self-start"
                        disabled={open.isPending}
                        onClick={() => open.mutate(tournament.slug)}
                    >
                        {open.isPending ? "Abriendo..." : "Abrir inscripciones"}
                    </Button>
                </>
            ) : (
                <>
                    <p className="text-muted">
                        {accepted < 2
                            ? "Necesitas al menos 2 equipos aceptados para empezar."
                            : `Al empezar se genera el cuadro con los ${accepted} equipos aceptados y se cierran las inscripciones. No se puede deshacer.`}
                    </p>
                    <div>
                        <ConfirmButton
                            label="Empezar torneo"
                            question="¿Empezar el torneo y generar el cuadro?"
                            variant="primary"
                            disabled={accepted < 2}
                            pending={start.isPending}
                            onConfirm={() => start.mutate(tournament.slug)}
                        />
                    </div>
                </>
            )}

            <div className="border-t border-line pt-4">
                <ConfirmButton
                    label="Borrar torneo"
                    question="¿Borrar el torneo y sus inscripciones?"
                    pending={remove.isPending}
                    onConfirm={() =>
                        remove.mutate(tournament.slug, { onSuccess: () => navigate("/panel", { replace: true }) })
                    }
                />
            </div>

            {error && (
                <p role="alert" className="text-sm font-semibold text-live">
                    {actionErrorMessage(error)}
                </p>
            )}
        </div>
    );
}