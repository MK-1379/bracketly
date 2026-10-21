import { z } from "zod";

export const registrationBodySchema = z.object({
    teamId: z.number().int().positive(),
});

export const registrationParamsSchema = z.object({
    slug: z.string().max(80),
    teamId: z.coerce.number().int().positive(),
});

export const reviewRegistrationSchema = z.object({
    status: z.enum(["ACCEPTED", "REJECTED"]),
});
