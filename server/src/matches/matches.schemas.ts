import { z } from "zod";

export const matchParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

const score = z.number().int().min(0);

export const reportMatchSchema = z.object({
    scoreA: score,
    scoreB: score,
    proofUrl: z
        .url({ protocol: /^https?$/ })
        .max(255)
        .optional(),
});

export const confirmMatchSchema = z.object({
    scoreA: score.optional(),
    scoreB: score.optional(),
});
