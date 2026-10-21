import { config } from "dotenv";
import { z } from "zod";

config({ path: "../.env", quiet: true });

const envSchema = z.object({
    DATABASE_URL: z.string().startsWith("mysql://"),
    PORT: z.coerce.number().default(3000),
});

export const env = envSchema.parse(process.env);