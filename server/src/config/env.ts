import { config } from "dotenv";
import { z } from "zod";

config({ path: "../.env", quiet: true });

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: z.string().startsWith("mysql://"),
    PORT: z.coerce.number().default(3000),
    JWT_SECRET: z.string().min(32),
});

export const env = envSchema.parse(process.env);