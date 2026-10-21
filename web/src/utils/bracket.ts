import type { Match, TeamSummary } from "../api/types";

export const CARD_WIDTH = 240;
export const ROW_HEIGHT = 40;
export const META_HEIGHT = 24;
export const CARD_HEIGHT = ROW_HEIGHT * 2 + META_HEIGHT;
export const COLUMN_GAP = 56;
export const SLOT_HEIGHT = 128;
export const HEADER_HEIGHT = 40;

const TEAM_COLORS = ["#8B73FF", "#26A69A", "#F97316", "#EAB308", "#60A5FA", "#F43F5E", "#94A3B8", "#22C55E"];

export function teamColor(teamId: number) {
    return TEAM_COLORS[teamId % TEAM_COLORS.length];
}

export function roundName(round: number, totalRounds: number) {
    const fromEnd = totalRounds - round;
    if (fromEnd === 0) {
        return "Final";
    }
    if (fromEnd === 1) {
        return "Semifinales";
    }
    if (fromEnd === 2) {
        return "Cuartos";
    }
    if (fromEnd === 3) {
        return "Octavos";
    }
    return `Ronda ${round}`;
}

export function columnX(round: number) {
    return (round - 1) * (CARD_WIDTH + COLUMN_GAP);
}

export function matchCenterY(round: number, position: number) {
    return HEADER_HEIGHT + (position - 0.5) * 2 ** (round - 1) * SLOT_HEIGHT;
}

export function slotY(match: Match, slot: "A" | "B") {
    const top = matchCenterY(match.round, match.position) - CARD_HEIGHT / 2;
    return top + (slot === "A" ? ROW_HEIGHT / 2 : ROW_HEIGHT * 1.5);
}

export function connectorPath(from: Match, to: Match | undefined, championX: number) {
    const startX = columnX(from.round) + CARD_WIDTH;
    const startY = slotY(from, "A") + ROW_HEIGHT / 2;
    if (!to || !from.nextSlot) {
        return `M ${startX} ${startY} H ${championX}`;
    }
    const middleX = startX + COLUMN_GAP / 2;
    return `M ${startX} ${startY} H ${middleX} V ${slotY(to, from.nextSlot)} H ${columnX(to.round)}`;
}

export function isBye(match: Match) {
    return match.status === "CONFIRMED" && (match.teamA === null || match.teamB === null);
}

export function winnerOf(match: Match): TeamSummary | null {
    if (match.winnerTeamId === null) {
        return null;
    }
    return match.teamA?.id === match.winnerTeamId ? match.teamA : match.teamB;
}