import { z } from "zod";

export const createTeamSchema = z.object({
    name: z.string().trim().min(2).max(40),
    tag: z
        .string()
        .trim()
        .toUpperCase()
        .regex(/^[A-Z0-9]{2,5}$/, "2 to 5 letters or numbers"),
});

export const teamParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export const memberParamsSchema = teamParamsSchema.extend({
    userId: z.coerce.number().int().positive(),
});

export const inviteParamsSchema = z.object({
    code: z.string().max(32),
});
