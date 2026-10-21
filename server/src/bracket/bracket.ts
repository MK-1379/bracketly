export type Slot = "A" | "B";

export interface NextMatchRef {
    round: number;
    position: number;
    slot: Slot;
}

export interface PlannedMatch {
    round: number;
    position: number;
    teamA: number | null;
    teamB: number | null;
    winner: number | null;
    isBye: boolean;
    next: NextMatchRef | null;
}

export function bracketSize(teamCount: number): number {
    if (!Number.isInteger(teamCount) || teamCount < 2) {
        throw new Error("A bracket needs at least 2 teams");
    }
    let size = 2;
    while (size < teamCount) {
        size *= 2;
    }
    return size;
}

export function seedOrder(size: number): number[] {
    let order = [1];
    while (order.length < size) {
        const length = order.length * 2;
        order = order.flatMap((seed) => [seed, length + 1 - seed]);
    }
    return order;
}

function nextMatchOf(round: number, position: number, totalRounds: number): NextMatchRef | null {
    if (round === totalRounds) {
        return null;
    }
    return {
        round: round + 1,
        position: Math.ceil(position / 2),
        slot: position % 2 === 1 ? "A" : "B",
    };
}

export function generateBracket(teamIds: number[]): PlannedMatch[] {
    if (new Set(teamIds).size !== teamIds.length) {
        throw new Error("Duplicate team ids");
    }

    const size = bracketSize(teamIds.length);
    const totalRounds = Math.log2(size);
    const order = seedOrder(size);
    const teamWithSeed = (seed: number) => teamIds[seed - 1] ?? null;

    const rounds: PlannedMatch[][] = [];
    for (let round = 1; round <= totalRounds; round++) {
        const matchCount = size / 2 ** round;
        rounds.push(
            Array.from({ length: matchCount }, (_, index) => ({
                round,
                position: index + 1,
                teamA: null,
                teamB: null,
                winner: null,
                isBye: false,
                next: nextMatchOf(round, index + 1, totalRounds),
            })),
        );
    }

    for (const match of rounds[0]) {
        match.teamA = teamWithSeed(order[2 * match.position - 2]);
        match.teamB = teamWithSeed(order[2 * match.position - 1]);

        if (match.teamB === null) {
            match.isBye = true;
            match.winner = match.teamA;

            if (match.next) {
                const nextMatch = rounds[match.next.round - 1][match.next.position - 1];
                if (match.next.slot === "A") {
                    nextMatch.teamA = match.winner;
                } else {
                    nextMatch.teamB = match.winner;
                }
            }
        }
    }

    return rounds.flat();
}
