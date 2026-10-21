import { z } from "zod";
import { TournamentStatus } from "../generated/prisma/enums.js";

export const createTournamentSchema = z.object({
    name: z.string().trim().min(3).max(80),
    gameId: z.number().int().positive(),
    description: z.string().trim().max(2000).optional(),
    rules: z.string().trim().max(5000).optional(),
    startsAt: z.coerce.date().refine((date) => date > new Date(), "Must be in the future"),
    maxTeams: z.number().int().min(2).max(64),
    teamSize: z.number().int().min(1).max(10),
    bestOf: z.union([z.literal(1), z.literal(3), z.literal(5)]),
});

export const updateTournamentSchema = createTournamentSchema.partial();

export const listTournamentsSchema = z.object({
    game: z.string().optional(),
    status: z.enum(TournamentStatus).optional(),
});

export const slugParamsSchema = z.object({
    slug: z.string().max(80),
});
