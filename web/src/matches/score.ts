export function winsNeeded(bestOf: number) {
    return Math.ceil(bestOf / 2);
}

export function isValidScore(bestOf: number, scoreA: number, scoreB: number) {
    const needed = winsNeeded(bestOf);
    return Math.max(scoreA, scoreB) === needed && Math.min(scoreA, scoreB) < needed;
}

export function isValidProofUrl(value: string) {
    if (!URL.canParse(value)) {
        return false;
    }
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
}
