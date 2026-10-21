import { expect, type Page } from "@playwright/test";

export async function enterDemo(page: Page, role: "organizador" | "capitán") {
    await page.goto("/entrar");
    await page.getByRole("button", { name: `Entrar como ${role}` }).click();
    await expect(page).toHaveURL("/panel");
}

export function uniqueName(prefix: string) {
    return `${prefix}${Date.now().toString(36)}`;
}
