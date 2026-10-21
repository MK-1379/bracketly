import { randomBytes } from "node:crypto";

export function slugify(text: string): string {
    return text
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60)
        .replace(/-+$/, "");
}

export function uniqueSlug(text: string): string {
    const base = slugify(text) || "torneo";
    return `${base}-${randomBytes(3).toString("hex")}`;
}
