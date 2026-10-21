import { execSync } from "node:child_process";

export default function setup() {
    const testUrl = process.env.DATABASE_URL_TEST;
    if (!testUrl?.includes("_test")) {
        throw new Error("DATABASE_URL_TEST must point to a database whose name ends in _test");
    }
    execSync("npx prisma migrate deploy", {
        env: { ...process.env, DATABASE_URL: testUrl },
        stdio: "inherit",
    });
}
