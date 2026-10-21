import { describe, expect, it } from "vitest";
import { slugify, uniqueSlug } from "./slug.js";

describe("slugify", () => {
    it.each([
        ["Copa de Verano", "copa-de-verano"],
        ["  Liga   Pro  ", "liga-pro"],
        ["Torneo Ñandú: Edición 2026!", "torneo-nandu-edicion-2026"],
        ["LoL 5v5 / EUW", "lol-5v5-euw"],
        ["¡¡¡", ""],
    ])("convierte %j en %j", (text, slug) => {
        expect(slugify(text)).toBe(slug);
    });

    it("no pasa de 60 caracteres ni termina en guion", () => {
        const slug = slugify(`${"a".repeat(59)} b`);
        expect(slug.length).toBeLessThanOrEqual(60);
        expect(slug.endsWith("-")).toBe(false);
    });
});

describe("uniqueSlug", () => {
    it("añade un sufijo aleatorio de 6 caracteres", () => {
        expect(uniqueSlug("Copa de Verano")).toMatch(/^copa-de-verano-[0-9a-f]{6}$/);
    });

    it("usa 'torneo' si el nombre no tiene letras ni números", () => {
        expect(uniqueSlug("¡¡¡")).toMatch(/^torneo-[0-9a-f]{6}$/);
    });

    it("da slugs distintos para el mismo nombre", () => {
        expect(uniqueSlug("Copa")).not.toBe(uniqueSlug("Copa"));
    });
});
