import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../db/prisma.js";
import { app, resetDatabase, signUp } from "./helpers.js";

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

describe("auth API", () => {
    it("registra un usuario y le da una cookie de sesión segura", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({ email: "Ana@Test.com", password: "supersecreta", displayName: "Ana" });

        expect(response.status).toBe(201);
        expect(response.body.user).toEqual({ id: expect.any(Number), email: "ana@test.com", displayName: "Ana" });
        expect(response.headers["set-cookie"][0]).toMatch(/^session=.+HttpOnly; SameSite=Lax/);
    });

    it("no devuelve nunca el hash de la contraseña", async () => {
        const { agent } = await signUp("ana");
        const response = await agent.get("/api/auth/me");

        expect(JSON.stringify(response.body)).not.toContain("passwordHash");
    });

    it("rechaza datos inválidos con el error de cada campo", async () => {
        const response = await request(app).post("/api/auth/register").send({ email: "mal", password: "123" });

        expect(response.status).toBe(400);
        expect(Object.keys(response.body.fields)).toEqual(["email", "password", "displayName"]);
    });

    it("no permite dos cuentas con el mismo email", async () => {
        await signUp("ana");
        const response = await request(app)
            .post("/api/auth/register")
            .send({ email: "ana@test.com", password: "otraclave", displayName: "Otra" });

        expect(response.status).toBe(409);
    });

    it("da el mismo error si el email no existe o la contraseña está mal", async () => {
        await signUp("ana");
        const wrongPassword = await request(app)
            .post("/api/auth/login")
            .send({ email: "ana@test.com", password: "incorrecta" });
        const unknownEmail = await request(app)
            .post("/api/auth/login")
            .send({ email: "nadie@test.com", password: "incorrecta" });

        expect(wrongPassword.status).toBe(401);
        expect(unknownEmail.status).toBe(401);
        expect(wrongPassword.body).toEqual(unknownEmail.body);
    });

    it("cierra la sesión con logout", async () => {
        const { agent } = await signUp("ana");

        expect((await agent.get("/api/auth/me")).status).toBe(200);
        expect((await agent.post("/api/auth/logout")).status).toBe(204);
        expect((await agent.get("/api/auth/me")).status).toBe(401);
    });

    it("rechaza una cookie con un token falso", async () => {
        const response = await request(app).get("/api/auth/me").set("Cookie", "session=abc.def.ghi");

        expect(response.status).toBe(401);
    });
});
