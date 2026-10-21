import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

config({ path: "../.env", quiet: true });

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: { path: "prisma/migrations", seed: "tsx prisma/seed.ts" },
    datasource: { url: env("DATABASE_URL") },
});