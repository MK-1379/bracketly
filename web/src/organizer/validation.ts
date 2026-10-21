import type { FormErrors } from "../auth/validation";
import type { TournamentData } from "./organizer.api";

export const TOURNAMENT_MESSAGES: Record<keyof TournamentData, string> = {
    name: "Entre 3 y 80 caracteres.",
    gameId: "Elige un juego.",
    startsAt: "Elige una fecha y hora futuras.",
    description: "Como máximo 2000 caracteres.",
    rules: "Como máximo 5000 caracteres.",
    maxTeams: "Elige una de las opciones.",
    teamSize: "Elige una de las opciones.",
    bestOf: "Elige una de las opciones.",
};

export function validateTournament(data: TournamentData): FormErrors<TournamentData> {
    const errors: FormErrors<TournamentData> = {};
    if (data.name.length < 3 || data.name.length > 80) {
        errors.name = TOURNAMENT_MESSAGES.name;
    }
    if (!data.gameId) {
        errors.gameId = TOURNAMENT_MESSAGES.gameId;
    }
    const startsAt = new Date(data.startsAt);
    if (Number.isNaN(startsAt.getTime()) || startsAt <= new Date()) {
        errors.startsAt = TOURNAMENT_MESSAGES.startsAt;
    }
    if ((data.description?.length ?? 0) > 2000) {
        errors.description = TOURNAMENT_MESSAGES.description;
    }
    if ((data.rules?.length ?? 0) > 5000) {
        errors.rules = TOURNAMENT_MESSAGES.rules;
    }
    return errors;
}