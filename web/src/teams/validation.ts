import type { FormErrors } from "../auth/validation";
import type { TeamData } from "./teams.api";

export const TEAM_MESSAGES = {
    name: "Entre 2 y 40 caracteres.",
    tag: "De 2 a 5 letras o números, sin espacios ni tildes.",
};

const TAG_PATTERN = /^[A-Z0-9]{2,5}$/;

export function validateTeam(data: TeamData): FormErrors<TeamData> {
    const errors: FormErrors<TeamData> = {};
    if (data.name.length < 2 || data.name.length > 40) {
        errors.name = TEAM_MESSAGES.name;
    }
    if (!TAG_PATTERN.test(data.tag)) {
        errors.tag = TEAM_MESSAGES.tag;
    }
    return errors;
}
