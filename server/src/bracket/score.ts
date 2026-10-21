export function isValidScore(bestOf: number, scoreA: number, scoreB: number): boolean {
    const scores = [scoreA, scoreB];
    if (!scores.every((score) => Number.isInteger(score) && score >= 0)) {
        return false;
    }
    const winsNeeded = Math.ceil(bestOf / 2);
    return Math.max(...scores) === winsNeeded && Math.min(...scores) < winsNeeded;
}
