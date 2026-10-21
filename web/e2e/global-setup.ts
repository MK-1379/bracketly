import { execSync } from "node:child_process";

export default function globalSetup() {
    const testDatabaseUrl = process.env.DATABASE_URL_TEST;
    if (!testDatabaseUrl?.includes("_test")) {
        throw new Error("DATABASE_URL_TEST must point to a database whose name ends in _test");
    }

    const options = {
        cwd: "../server",
        env: { ...process.env, DATABASE_URL: testDatabaseUrl, NODE_ENV: "test" },
        stdio: "inherit",
    } as const;

    execSync("npx prisma migrate deploy", options);
    execSync("npm run db:seed", options);
    execSync("npm run db:demo", options);
}
