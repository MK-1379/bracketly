import { config } from "dotenv";
import { defineConfig } from "vitest/config";

config({ path: "../.env", quiet: true });

export default defineConfig({
    test: {
        env: {
            NODE_ENV: "test",
            DATABASE_URL: process.env.DATABASE_URL_TEST ?? "",
        },
        globalSetup: ["./src/test/global-setup.ts"],
        fileParallelism: false,
        testTimeout: 20_000,
    },
});
