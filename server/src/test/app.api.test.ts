import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "./helpers.js";

describe("cabeceras", () => {
    it("no dice que la API está hecha con Express", async () => {
        const response = await request(app).get("/api/games");

        expect(response.headers["x-powered-by"]).toBeUndefined();
    });
});