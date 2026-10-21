import { describe, expect, it } from "vitest";
import { bracketSize, generateBracket, seedOrder } from "./bracket.js";

const teams = (count: number) => Array.from({ length: count }, (_, index) => 101 + index);

describe("bracketSize", () => {
    it.each([
        [2, 2],
        [3, 4],
        [5, 8],
        [8, 8],
        [9, 16],
        [16, 16],
    ])("con %i equipos el cuadro es de %i", (teamCount, size) => {
        expect(bracketSize(teamCount)).toBe(size);
    });

    it("lanza un error con menos de 2 equipos", () => {
        expect(() => bracketSize(1)).toThrow();
        expect(() => bracketSize(0)).toThrow();
    });
});

describe("seedOrder", () => {
    it("empareja a los mejores con los peores", () => {
        expect(seedOrder(2)).toEqual([1, 2]);
        expect(seedOrder(4)).toEqual([1, 4, 2, 3]);
        expect(seedOrder(8)).toEqual([1, 8, 4, 5, 2, 7, 3, 6]);
    });
});

describe("generateBracket", () => {
    it.each([2, 3, 5, 8, 16])("con %i equipos crea un cuadro completo", (teamCount) => {
        const size = bracketSize(teamCount);
        const matches = generateBracket(teams(teamCount));
        const firstRound = matches.filter((match) => match.round === 1);
        const teamsInFirstRound = firstRound
            .flatMap((match) => [match.teamA, match.teamB])
            .filter((team) => team !== null)
            .sort((a, b) => a - b);

        expect(matches).toHaveLength(size - 1);
        expect(firstRound).toHaveLength(size / 2);
        expect(firstRound.filter((match) => match.isBye)).toHaveLength(size - teamCount);
        expect(teamsInFirstRound).toEqual(teams(teamCount));
        expect(matches.filter((match) => match.next === null)).toHaveLength(1);
    });

    it("da los byes a los mejores cabezas de serie", () => {
        const byeWinners = generateBracket(teams(5))
            .filter((match) => match.isBye)
            .map((match) => match.winner)
            .sort();

        expect(byeWinners).toEqual([101, 102, 103]);
    });

    it("pasa a los ganadores de un bye a la segunda ronda", () => {
        const secondRound = generateBracket(teams(5)).filter((match) => match.round === 2);

        expect(secondRound[0]).toMatchObject({ teamA: 101, teamB: null });
        expect(secondRound[1]).toMatchObject({ teamA: 102, teamB: 103 });
    });

    it("separa a los cabezas de serie 1 y 2 hasta la final", () => {
        const firstRound = generateBracket(teams(16)).filter((match) => match.round === 1);
        const positionOf = (team: number) =>
            firstRound.find((match) => match.teamA === team || match.teamB === team)?.position;

        expect(positionOf(101)).toBeLessThanOrEqual(4);
        expect(positionOf(102)).toBeGreaterThan(4);
    });

    it("enlaza cada partido con el siguiente", () => {
        const matches = generateBracket(teams(8));
        const find = (round: number, position: number) =>
            matches.find((match) => match.round === round && match.position === position);

        expect(find(1, 1)?.next).toEqual({ round: 2, position: 1, slot: "A" });
        expect(find(1, 2)?.next).toEqual({ round: 2, position: 1, slot: "B" });
        expect(find(2, 2)?.next).toEqual({ round: 3, position: 1, slot: "B" });
        expect(find(3, 1)?.next).toBeNull();
    });

    it("lanza un error si un equipo está repetido", () => {
        expect(() => generateBracket([101, 102, 101])).toThrow();
    });
});