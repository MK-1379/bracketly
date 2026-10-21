const teamInMatch = { select: { id: true, name: true, tag: true } } as const;

export const matchSelect = {
    id: true,
    round: true,
    position: true,
    status: true,
    scoreA: true,
    scoreB: true,
    proofUrl: true,
    nextMatchId: true,
    nextSlot: true,
    winnerTeamId: true,
    reportedBy: { select: { displayName: true } },
    updatedAt: true,
    teamA: teamInMatch,
    teamB: teamInMatch,
} as const;
