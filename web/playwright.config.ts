import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

if (existsSync("../.env")) {
    process.loadEnvFile("../.env");
}

const API_PORT = 3101;
const WEB_PORT = 5174;
const testDatabaseUrl = process.env.DATABASE_URL_TEST ?? "";

export default defineConfig({
    testDir: "./e2e",
    fullyParallel: false,
    workers: 1,
    retries: process.env.CI ? 1 : 0,
    forbidOnly: Boolean(process.env.CI),
    reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
    globalSetup: "./e2e/global-setup.ts",
    use: {
        baseURL: `http://localhost:${WEB_PORT}`,
        trace: "retain-on-failure",
        locale: "es-ES",
        timezoneId: "Europe/Madrid",
    },
    projects: [
        { name: "escritorio", use: { ...devices["Desktop Chrome"] }, testIgnore: /\.movil\.spec\.ts/ },
        { name: "movil", use: { ...devices["Pixel 7"] }, testMatch: /\.movil\.spec\.ts/ },
    ],
    webServer: [
        {
            command: "npm run dev",
            cwd: "../server",
            url: `http://localhost:${API_PORT}/api/health`,
            env: { NODE_ENV: "test", PORT: String(API_PORT), DATABASE_URL: testDatabaseUrl, DEMO_MODE: "true" },
            reuseExistingServer: false,
        },
        {
            command: `npm run dev -- --port ${WEB_PORT} --strictPort`,
            url: `http://localhost:${WEB_PORT}`,
            env: { API_URL: `http://localhost:${API_PORT}` },
            reuseExistingServer: false,
        },
    ],
});