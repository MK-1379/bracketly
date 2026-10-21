import type { TournamentStatus } from "../api/types";

const dateFormat = new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
});

export function formatDate(iso: string) {
    return dateFormat.format(new Date(iso));
}

export const STATUS_LABELS: Record<TournamentStatus, string> = {
    DRAFT: "Borrador",
    REGISTRATION: "Inscripciones abiertas",
    IN_PROGRESS: "En curso",
    FINISHED: "Terminado",
};