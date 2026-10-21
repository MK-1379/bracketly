import { describe, expect, it } from "vitest";
import { isValidScore } from "./score.js";

describe("isValidScore", () => {
    it.each([
        [1, 1, 0],
        [1, 0, 1],
        [3, 2, 0],
        [3, 2, 1],
        [3, 1, 2],
        [5, 3, 2],
    ])("al mejor de %i, %i-%i es válido", (bestOf, scoreA, scoreB) => {
        expect(isValidScore(bestOf, scoreA, scoreB)).toBe(true);
    });

    it.each([
        [1, 0, 0],
        [1, 1, 1],
        [3, 1, 1],
        [3, 2, 2],
        [3, 3, 0],
        [5, 2, 2],
        [3, -1, 2],
        [3, 1.5, 2],
    ])("al mejor de %i, %d-%d no es válido", (bestOf, scoreA, scoreB) => {
        expect(isValidScore(bestOf, scoreA, scoreB)).toBe(false);
    });
});
